import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import {
  getConversationsApi,
  getConversationMessagesApi,
  sendMessageApi,
  markConversationReadApi,
} from '../api/chat.api.js';
import { Message, FileItem } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';
import { useSocket } from '../context/SocketContext.js';
import { FileUploadComponent } from '../components/FileUploadComponent.js';
import {
  MessageSquare,
  Send,
  Paperclip,
  Search,
  FileText,
  ExternalLink,
  Loader2,
  CheckCheck,
  X,
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const {
    socket,
    onlineUsers,
    typingUsers,
    joinConversation,
    leaveConversation,
    sendTyping,
    markConversationRead,
  } = useSocket();

  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeConversationId = searchParams.get('conversationId');

  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch conversations
  const { data: conversations = [], isLoading: isConversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversationsApi,
  });

  // Pick default conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setSearchParams({ conversationId: conversations[0].id });
    }
  }, [activeConversationId, conversations, setSearchParams]);

  // 2. Fetch messages for active conversation
  const { data: messagesData, isLoading: isMessagesLoading } = useQuery({
    queryKey: ['messages', activeConversationId],
    queryFn: () => getConversationMessagesApi(activeConversationId!),
    enabled: !!activeConversationId,
  });

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  // 3. Socket Room Join / Leave
  useEffect(() => {
    if (!activeConversationId) return;

    joinConversation(activeConversationId);
    markConversationRead(activeConversationId);
    markConversationReadApi(activeConversationId).catch(() => {});

    return () => {
      leaveConversation(activeConversationId);
    };
  }, [activeConversationId, joinConversation, leaveConversation, markConversationRead]);

  // 4. Socket Listener for Incoming Messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (newMsg: Message) => {
      if (newMsg.conversationId === activeConversationId) {
        queryClient.setQueryData(
          ['messages', activeConversationId],
          (old: { messages: Message[] } | undefined) => {
            if (!old)
              return {
                messages: [newMsg],
                pagination: { total: 1, page: 1, limit: 30, totalPages: 1 },
              };
            return {
              ...old,
              messages: [...old.messages, newMsg],
            };
          }
        );
        markConversationRead(activeConversationId);
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [socket, activeConversationId, queryClient, markConversationRead]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: (data: { content: string; fileIds?: string[] }) =>
      sendMessageApi(activeConversationId!, data),
    onSuccess: (newMsg) => {
      queryClient.setQueryData(
        ['messages', activeConversationId],
        (old: { messages: Message[] } | undefined) => {
          if (!old)
            return {
              messages: [newMsg],
              pagination: { total: 1, page: 1, limit: 30, totalPages: 1 },
            };
          return {
            ...old,
            messages: [...old.messages, newMsg],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setInputText('');
      setAttachedFiles([]);
      setShowAttachmentUploader(false);
      sendTyping(activeConversationId!, false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    if (!activeConversationId) return;

    sendTyping(activeConversationId, true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(activeConversationId, false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && attachedFiles.length === 0) || !activeConversationId) return;

    sendMutation.mutate({
      content: inputText.trim() || 'Sent attachments',
      fileIds: attachedFiles.map((f) => f.id),
    });
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    const partnerName = `${c.partner?.firstName || ''} ${c.partner?.lastName || ''}`.toLowerCase();
    const projectTitle = c.contract?.project?.title?.toLowerCase() || '';
    return (
      partnerName.includes(searchQuery.toLowerCase()) ||
      projectTitle.includes(searchQuery.toLowerCase())
    );
  });

  const activeTypingList =
    activeConversationId && typingUsers[activeConversationId]
      ? typingUsers[activeConversationId].filter((id) => id !== user?.id)
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col h-[calc(100vh-140px)]">
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-xl flex-1 flex shadow-2xl">
        {/* Left Sidebar: Conversations List */}
        <div className="w-full sm:w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/40">
          {/* Header & Search */}
          <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-400" /> Direct Messages
            </h1>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-850">
            {isConversationsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Loading chats...</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-16 text-center text-xs text-slate-400 p-4">
                No active conversations yet. Messages appear automatically when contracts start or
                proposals are discussed.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const partner = conv.partner;
                const isSelected = conv.id === activeConversationId;
                const isOnline = partner && onlineUsers.includes(partner.id);

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSearchParams({ conversationId: conv.id })}
                    className={`w-full p-4 flex items-start gap-3 text-left transition-colors ${
                      isSelected
                        ? 'bg-slate-800/80 border-l-4 border-brand-400'
                        : 'hover:bg-slate-900/60'
                    }`}
                  >
                    {/* Avatar with Online Dot */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700">
                        {partner?.avatarUrl ? (
                          <img
                            src={partner.avatarUrl}
                            alt={partner.firstName}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          `${partner?.firstName?.[0] || 'U'}${partner?.lastName?.[0] || ''}`
                        )}
                      </div>
                      {isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">
                          {partner?.firstName} {partner?.lastName}
                        </p>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {conv.updatedAt
                            ? new Date(conv.updatedAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>

                      {conv.contract?.project?.title && (
                        <p className="text-[10px] text-brand-400 font-semibold truncate mt-0.5">
                          {conv.contract.project.title}
                        </p>
                      )}

                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {conv.lastMessage?.content || 'Started conversation'}
                      </p>
                    </div>

                    {conv.isUnread && (
                      <span className="w-2 h-2 rounded-full bg-brand-400 self-center shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area: Active Chat */}
        {activeConversation ? (
          <div className="flex-1 flex flex-col bg-slate-950/20">
            {/* Active Partner Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-950/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white border border-slate-700 shrink-0">
                  {activeConversation.partner?.avatarUrl ? (
                    <img
                      src={activeConversation.partner.avatarUrl}
                      alt={activeConversation.partner.firstName}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    `${activeConversation.partner?.firstName?.[0] || 'U'}${activeConversation.partner?.lastName?.[0] || ''}`
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeConversation.partner?.firstName} {activeConversation.partner?.lastName}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                        onlineUsers.includes(activeConversation.partner?.id || '')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {onlineUsers.includes(activeConversation.partner?.id || '')
                        ? 'Online'
                        : 'Offline'}
                    </span>
                  </h2>

                  {activeConversation.contract && (
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Project: {activeConversation.contract.project.title}
                    </p>
                  )}
                </div>
              </div>

              {activeConversation.contractId && (
                <Link
                  to={`/contracts/${activeConversation.contractId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  Contract Workspace <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {isMessagesLoading ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading messages...</p>
                </div>
              ) : messagesData?.messages.length === 0 ? (
                <div className="py-20 text-center text-xs text-slate-400">
                  Say hello and discuss project deliverables!
                </div>
              ) : (
                messagesData?.messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md sm:max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                          isMine
                            ? 'bg-brand-500 text-slate-950 font-medium rounded-tr-none shadow-md shadow-brand-500/10'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>

                        {/* Files preview */}
                        {msg.files && msg.files.length > 0 && (
                          <div className="space-y-1 pt-1">
                            {msg.files.map((file) => (
                              <a
                                key={file.id}
                                href={file.url}
                                target="_blank"
                                rel="noreferrer"
                                className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-semibold ${
                                  isMine
                                    ? 'bg-slate-950/20 hover:bg-slate-950/30 text-slate-950'
                                    : 'bg-slate-950 hover:bg-slate-850 text-slate-200 border border-slate-800'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span className="truncate flex-1">{file.originalName}</span>
                                <ExternalLink className="w-3 h-3 opacity-60" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-slate-500 mt-1 px-1 flex items-center gap-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isMine && <CheckCheck className="w-3 h-3 text-brand-400" />}
                      </span>
                    </div>
                  );
                })
              )}

              {/* Typing Indicator */}
              {activeTypingList.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-brand-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-brand-400" />
                  <span>Partner is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* File Attachment Drawer in Chat */}
            {showAttachmentUploader && (
              <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">Attach Files to Message</span>
                  <button
                    onClick={() => setShowAttachmentUploader(false)}
                    className="p-1 text-slate-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <FileUploadComponent
                  entityType="CHAT"
                  entityId={activeConversationId || undefined}
                  maxFiles={3}
                  onFilesUploaded={(files) => setAttachedFiles(files)}
                />
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={() => setShowAttachmentUploader(!showAttachmentUploader)}
                className={`p-2.5 rounded-xl transition-colors ${
                  showAttachmentUploader || attachedFiles.length > 0
                    ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
                title="Attach files"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type your message..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />

              <button
                type="submit"
                disabled={
                  (!inputText.trim() && attachedFiles.length === 0) || sendMutation.isPending
                }
                className="p-2.5 rounded-xl bg-brand-400 hover:bg-brand-300 text-slate-950 font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-brand-500/10 active:scale-95"
              >
                {sendMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950/20 space-y-3">
            <div className="p-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400">
              <MessageSquare className="w-8 h-8 text-brand-400" />
            </div>
            <h3 className="text-base font-bold text-white">Select a conversation</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Choose a discussion thread from the left to collaborate and coordinate project
              deliverables.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
