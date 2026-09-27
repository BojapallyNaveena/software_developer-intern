import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Users, Circle, ShieldCheck, X } from 'lucide-react';

export default function OnlineUsersList({ isOpen, onClose }) {
  const { onlineUsers, user } = useSocket();

  const activeCount = onlineUsers.filter((u) => u.is_online).length;

  return (
    <aside
      className={`fixed lg:static inset-y-0 right-0 w-72 bg-slate-900 border-l border-slate-800 flex flex-col z-30 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h2 className="font-bold text-slate-200 text-sm">Community Members</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            {activeCount} Online
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {onlineUsers.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-xs font-medium">
            No connected users found.
          </div>
        ) : (
          onlineUsers.map((u) => {
            const isSelf = u.username === user?.username;
            const isOnline = Boolean(u.is_online);

            return (
              <div
                key={u.id || u.username}
                className={`flex items-center justify-between p-2.5 rounded-xl transition ${
                  isSelf ? 'bg-slate-800/60 border border-slate-700/50' : 'hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center border border-slate-700 uppercase shrink-0">
                      {u.username.charAt(0)}
                    </div>
                    <span
                      className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${
                        isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {u.username}
                      </span>
                      {isSelf && (
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                          You
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {isOnline ? 'Active in room' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-slate-800 text-center">
        <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Powered by Socket.io Realtime
        </span>
      </div>
    </aside>
  );
}
