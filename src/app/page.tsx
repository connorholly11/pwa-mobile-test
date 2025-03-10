'use client';

import { ChatProvider } from './contexts/ChatContext';
import ChatInterface from './components/ChatInterface';
import AdminPanel from './components/AdminPanel';
import BottomTabs from './components/BottomTabs';
import { useChat } from './contexts/ChatContext';

function AppContent() {
  const { activeTab } = useChat();

  return (
    <div className="app-container">
      <div className="tab-content">
        {activeTab === 'chat' ? <ChatInterface /> : <AdminPanel />}
      </div>
      <BottomTabs />
    </div>
  );
}

export default function Home() {
  return (
    <main className="main-container">
      <ChatProvider>
        <AppContent />
      </ChatProvider>
    </main>
  );
}
