import React, { useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send, Zap, Globe } from 'lucide-react';

export default function ChatInput() {
  const { sendMessage, startTyping, stopTyping, isConnected } = useSocket();
  const [inputText, setInputText] = useState('');
  const [useRestApi, setUseRestApi] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    if (e.target.value.trim().length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isSending) return;

    const messageText = inputText;
    setInputText('');
    setIsSending(true);

    try {
      await sendMessage(messageText, useRestApi);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore input text on error
      setInputText(messageText);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
      <div className="max-w-4xl mx-auto space-y-2">
        {/* Delivery Method Toggle Banner */}
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Mode:</span>
            <button
              type="button"
              onClick={() => setUseRestApi(false)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition font-medium ${
                !useRestApi
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3 h-3" /> Socket.io (Mandatory)
            </button>
            <button
              type="button"
              onClick={() => setUseRestApi(true)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition font-medium ${
                useRestApi
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3 h-3" /> REST API Fallback
            </button>
          </div>

          <span className="hidden sm:inline text-slate-500">
            Press <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">Enter</kbd> to send
          </span>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <div className="relative flex-1">
            <textarea
              rows="1"
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={stopTyping}
              placeholder={
                !isConnected && !useRestApi
                  ? 'Connecting to socket server...'
                  : 'Type your message...'
              }
              className="w-full pl-4 pr-10 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl text-slate-100 placeholder-slate-500 outline-none resize-none text-sm font-medium transition"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-3.5 bg-blue-600 hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-2xl shadow-lg shadow-blue-600/20 transition flex items-center justify-center shrink-0"
            title="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
