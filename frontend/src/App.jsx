import React, { useState } from 'react';
import { useSocket } from './context/SocketContext';
import LoginModal from './components/LoginModal';
import ChatHeader from './components/ChatHeader';
import OnlineUsersList from './components/OnlineUsersList';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';

export default function App() {
  const { user } = useSocket();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) {
    return <LoginModal />;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      <ChatHeader
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col h-full bg-slate-950/40 relative">
          <MessageList />
          <ChatInput />
        </main>

        <OnlineUsersList
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      </div>
    </div>
  );
}
