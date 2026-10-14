import React, { useState, useEffect, useRef } from 'react';
import { chatApi } from '../../api/chatApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import {
  Send,
  Paperclip,
  MessageSquare,
  Search,
  Check,
  CheckCheck,
  Smile,
  Shield,
  Circle,
} from 'lucide-react';

export const MessagesPage = () => {
  const { user } = useAuth();
  const { socket, isUserOnline, latestMessage } = useSocket();

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch user conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatApi.getConversations();
        if (res.data) {
          setConversations(res.data);
          if (res.data.length > 0 && !activeConversation) {
            setActiveConversation(res.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      } finally {
        setLoadingConversations(false);
      }
    };
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await chatApi.getMessages(activeConversation.id);
        if (res.data) setMessages(res.data.messages || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();

    // Join socket room
    if (socket) {
      socket.emit('join_conversation', activeConversation.id);
    }

    return () => {
      if (socket) {
        socket.emit('leave_conversation', activeConversation.id);
      }
    };
  }, [activeConversation, socket]);

  // Handle incoming realtime message
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConversation && msg.conversationId === activeConversation.id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTypingStart = ({ senderId }) => {
      if (activeConversation && senderId !== user?.id) setIsTyping(true);
    };

    const handleTypingStop = ({ senderId }) => {
      if (activeConversation && senderId !== user?.id) setIsTyping(false);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing_start', handleTypingStart);
    socket.on('typing_stop', handleTypingStop);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing_start', handleTypingStart);
      socket.off('typing_stop', handleTypingStop);
    };
  }, [socket, activeConversation, user]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) return;
    if (!activeConversation) return;

    const recipient =
      activeConversation.client?.id === user?.id
        ? activeConversation.freelancer
        : activeConversation.client;

    const currentText = text;
    const currentFile = file;
    setText('');
    setFile(null);

    try {
      if (socket) {
        socket.emit('typing_stop', {
          conversationId: activeConversation.id,
          recipientId: recipient?.id,
        });
        socket.emit('send_message', {
          conversationId: activeConversation.id,
          recipientId: recipient?.id,
          content: currentText,
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.client?.id === user?.id ? conv.freelancer : conv.client;
  };

  return (
    <div className="h-[calc(100vh-9.5rem)] cyber-card bg-white dark:bg-[#111726]/90 rounded-3xl border border-slate-200 dark:border-blue-500/25 shadow-xl overflow-hidden flex flex-col md:flex-row">
      {/* Conversations Sidebar */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50/70 dark:bg-[#0D1220]/80">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#111726]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">Direct Messages</h2>
          </div>
          <span className="text-xs text-[#3B82F6] dark:text-[#60A5FA] font-mono font-semibold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
            {conversations.length} Active
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
          {loadingConversations ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-10 h-10" variant="circle" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="w-24 h-4" />
                    <Skeleton className="w-36 h-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No active conversations yet. Connect with clients or freelancers on project cards.
            </div>
          ) : (
            conversations.map((conv) => {
              const other = getOtherParticipant(conv);
              const isSelected = activeConversation?.id === conv.id;
              const online = other ? isUserOnline(other.id) : false;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 text-left transition-all ${
                    isSelected
                      ? 'bg-blue-50/90 dark:bg-blue-900/25 border-l-4 border-[#3B82F6]'
                      : 'hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={other?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${other?.name}`}
                      alt={other?.name}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-blue-500/30"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111726]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-[#F8FAFC] truncate">
                        {other?.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {conv.messages?.[0]?.content || 'Started conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-[#080B12]/40">
        {activeConversation ? (
          <>
            {/* Window Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#111726]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={
                      getOtherParticipant(activeConversation)?.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${getOtherParticipant(activeConversation)?.name}`
                    }
                    alt={getOtherParticipant(activeConversation)?.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-blue-500/30"
                  />
                  {isUserOnline(getOtherParticipant(activeConversation)?.id) && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#111726]" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-[#F8FAFC]">
                    {getOtherParticipant(activeConversation)?.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {isUserOnline(getOtherParticipant(activeConversation)?.id) ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Online
                      </span>
                    ) : (
                      <span>Offline</span>
                    )}
                    {isTyping && <span className="text-[#3B82F6] italic">• typing...</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {loadingMessages ? (
                <div className="space-y-3">
                  <Skeleton className="w-1/3 h-10 ml-auto" />
                  <Skeleton className="w-1/2 h-10" />
                  <Skeleton className="w-1/4 h-10 ml-auto" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30 text-[#3B82F6]" />
                  <span>Start an encrypted conversation...</span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user?.id;

                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white rounded-br-xs shadow-md'
                            : 'bg-white dark:bg-[#111726] text-slate-800 dark:text-[#F8FAFC] rounded-bl-xs border border-slate-200 dark:border-slate-800 shadow-sm'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-line">{m.content}</p>
                        {m.fileUrl && (
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] underline block pt-1 opacity-90"
                          >
                            📎 Attached File
                          </a>
                        )}
                        <span
                          className={`block text-[10px] text-right font-mono ${
                            isMe ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111726] flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Attach deliverable file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />

              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (socket && activeConversation) {
                    socket.emit('typing_start', {
                      conversationId: activeConversation.id,
                      recipientId: getOtherParticipant(activeConversation)?.id,
                    });
                  }
                }}
                onBlur={() => {
                  if (socket && activeConversation) {
                    socket.emit('typing_stop', {
                      conversationId: activeConversation.id,
                      recipientId: getOtherParticipant(activeConversation)?.id,
                    });
                  }
                }}
                placeholder={file ? `File attached: ${file.name}` : 'Type your encrypted message...'}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-[#0D1220] border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 focus:bg-white dark:focus:bg-[#0D1220] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6]"
              />

              <button
                type="submit"
                disabled={!text.trim() && !file}
                className="btn-electric p-2.5 rounded-xl text-white shadow-sm disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No conversation selected"
            description="Select a chat thread from the left panel to message clients or freelancers."
          />
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
