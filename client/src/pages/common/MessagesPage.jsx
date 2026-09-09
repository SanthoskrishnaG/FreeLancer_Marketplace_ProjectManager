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
      if (activeConversation && senderId !== user.id) setIsTyping(true);
    };

    const handleTypingStop = ({ senderId }) => {
      if (activeConversation && senderId !== user.id) setIsTyping(false);
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
      activeConversation.client?.id === user.id
        ? activeConversation.freelancer
        : activeConversation.client;

    const currentText = text;
    const currentFile = file;
    setText('');
    setFile(null);

    try {
      if (socket) {
        socket.emit('typing_stop', { conversationId: activeConversation.id, recipientId: recipient.id });
        socket.emit('send_message', {
          conversationId: activeConversation.id,
          recipientId: recipient.id,
          content: currentText,
        });
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getOtherParticipant = (conv) => {
    return conv.client?.id === user.id ? conv.freelancer : conv.client;
  };

  return (
    <div className="h-[calc(100vh-10rem)] glass-card rounded-3xl border border-gray-800 overflow-hidden flex shadow-2xl">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-800 flex flex-col shrink-0 bg-gray-950/60">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Direct Messages</h2>
          <span className="text-xs text-indigo-400 font-medium">{conversations.length} Active</span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
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
            <div className="p-8 text-center text-xs text-gray-500">
              No active conversations. Connect with clients or freelancers on project pages.
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
                  className={`w-full p-4 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-indigo-600/15 border-l-2 border-indigo-500' : 'hover:bg-gray-800/40'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={other?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${other?.name}`}
                      alt={other?.name}
                      className="w-11 h-11 rounded-xl object-cover ring-1 ring-gray-700"
                    />
                    {online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-gray-900" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">{other?.name}</h4>
                      <span className="text-[10px] text-gray-500">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
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
      <div className="flex-1 flex flex-col bg-[#0B0F19]">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="px-6 py-3.5 border-b border-gray-800 flex items-center justify-between bg-gray-900/40">
              <div className="flex items-center gap-3">
                <img
                  src={
                    getOtherParticipant(activeConversation)?.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${getOtherParticipant(activeConversation)?.name}`
                  }
                  alt={getOtherParticipant(activeConversation)?.name}
                  className="w-9 h-9 rounded-xl object-cover ring-1 ring-gray-700"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {getOtherParticipant(activeConversation)?.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    {isUserOnline(getOtherParticipant(activeConversation)?.id) ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Online
                      </span>
                    ) : (
                      <span>Offline</span>
                    )}
                    {isTyping && <span className="text-indigo-400 italic">• typing...</span>}
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
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
                  <span>Start a conversation...</span>
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.senderId === user.id;

                  return (
                    <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md px-4 py-2.5 rounded-2xl text-xs space-y-1 ${
                          isMe
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-md shadow-indigo-600/20'
                            : 'bg-gray-800 text-gray-200 rounded-bl-xs border border-gray-700'
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
                          className={`block text-[10px] text-right ${
                            isMe ? 'text-indigo-200' : 'text-gray-400'
                          }`}
                        >
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              className="p-4 border-t border-gray-800 bg-gray-900/40 flex items-center gap-3"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-gray-800 transition-colors"
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
                placeholder={file ? `File attached: ${file.name}` : 'Type your message...'}
                className="flex-1 px-4 py-2.5 bg-gray-800/80 border border-gray-700/60 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />

              <button
                type="submit"
                disabled={!text.trim() && !file}
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <EmptyState
            icon={MessageSquare}
            title="No conversation selected"
            description="Select a chat from the left panel to message clients or freelancers."
          />
        )}
      </div>
    </div>
  );
};
