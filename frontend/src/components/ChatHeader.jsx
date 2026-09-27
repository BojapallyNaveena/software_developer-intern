import React from 'react';
import { useSocket } from '../context/SocketContext';
import { MessageSquare, Users, LogOut, Wifi, WifiOff } from 'lucide-react';

export default function ChatHeader({ onToggleSidebar, isSidebarOpen }) {
  const { user, logout, isConnected, onlineUsers } = useSocket();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition lg:hidden"
          title="Toggle online users sidebar"
        >
          <Users className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-none">PulseChat</h1>
            <span className="text-[11px] text-slate-400 font-medium">Real-Time Workspace</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-5">
        {/* Socket Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isConnected
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}
          title={isConnected ? 'Connected to Socket.io real-time server' : 'Disconnected from server. Reconnecting...'}
        >
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <Wifi className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Socket</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Connecting...</span>
            </>
          )}
        </div>

        {/* User Info & Logout */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-200">{user.username}</span>
              <span className="text-[10px] text-slate-400">Active Session</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-md border border-blue-400/30">
              {user.username.charAt(0)}
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition"
              title="Logout session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
