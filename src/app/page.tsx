'use client';

import { ChatProvider } from './contexts/ChatContext';
import ChatInterface from './components/ChatInterface';
import DiscoverInterface from './components/DiscoverInterface';
import BottomTabs from './components/BottomTabs';
import { useChat } from './contexts/ChatContext';

function AppContent() {
  const { activeTab } = useChat();

  return (
    <div className="app-container">
      <div className="main-content">
        {activeTab === 'chat' ? <ChatInterface /> : <DiscoverInterface />}
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
