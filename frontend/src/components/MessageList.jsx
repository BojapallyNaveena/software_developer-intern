import React, { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { Check, CheckCheck, Loader2 } from 'lucide-react';

const formatTime = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

export default function MessageList() {
  const { messages, user, typingUsers, loadingHistory, error } = useSocket();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  if (loadingHistory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="text-xs font-medium">Loading chat history from server...</span>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs text-center font-medium">
          {error}
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2 text-center py-12">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 text-xl font-bold">
            💬
          </div>
          <h3 className="font-semibold text-slate-300 text-sm">No messages yet</h3>
          <p className="text-xs text-slate-500 max-w-xs">
            Start the conversation by sending a message below! All messages update in real time.
          </p>
        </div>
      ) : (
        messages.map((msg) => {
          const isSelf = msg.sender === user?.username;

          return (
            <div
              key={msg.id || `${msg.sender}-${msg.timestamp}`}
              className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} group animate-fadeIn`}
            >
              <div className="flex items-center gap-2 mb-1 px-1">
                <span className="text-xs font-semibold text-slate-400">
                  {isSelf ? 'You' : msg.sender}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {formatTime(msg.timestamp)}
                </span>
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm text-sm break-words relative ${
                  isSelf
                    ? 'bg-blue-600 text-white rounded-br-none border border-blue-500/30'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Status indicator for self */}
                {isSelf && (
                  <div className="flex justify-end items-center mt-1 space-x-1 text-[10px] text-blue-200/80">
                    {msg.status === 'read' ? (
                      <CheckCheck className="w-3.5 h-3.5 text-sky-300" title="Read" />
                    ) : (
                      <Check className="w-3.5 h-3.5 text-blue-200" title="Delivered" />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* Typing indicators */}
      {typingUsers && typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-slate-400 italic pt-2 animate-pulse">
          <div className="flex space-x-1 bg-slate-800 px-3 py-2 rounded-xl rounded-bl-none border border-slate-700">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
