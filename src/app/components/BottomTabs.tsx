'use client';

import { useChat } from '../contexts/ChatContext';

export default function BottomTabs() {
  const { activeTab, setActiveTab } = useChat();

  return (
    <div className="bottom-tabs">
      <button 
        className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
        onClick={() => setActiveTab('chat')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"></path>
        </svg>
        <span>Chat</span>
      </button>
      
      <button 
        className={`tab-button ${activeTab === 'admin' ? 'active' : ''}`}
        onClick={() => setActiveTab('admin')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
        </svg>
        <span>Admin</span>
      </button>
    </div>
  );
} 