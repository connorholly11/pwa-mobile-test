'use client';

import { useChat } from '../contexts/ChatContext';
import { useState, useEffect } from 'react';
import { useUINotifications } from '../contexts/UINotificationContext';
import PromptTester from './PromptTester';

export default function AdminPanel() {
  const { 
    messages, 
    clearChat, 
    lastTokenUsage,
    aiPersonality
  } = useChat();
  const { addNotification } = useUINotifications();
  
  // Stats for monitoring
  const [stats, setStats] = useState({
    totalMessages: 0,
    userMessages: 0,
    aiMessages: 0,
    averageAIResponseTime: 0,
    totalPromptTokens: 0,
    totalCompletionTokens: 0,
    totalCost: 0,
    sessionStartTime: new Date(),
    messageCounts: {
      total: 0,
      user: 0,
      ai: 0
    },
    tokenUsage: {
      total: 0,
      prompt: 0,
      completion: 0
    }
  });

  // Active tab in admin panel
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'prompts'>('analytics');

  // Calculate statistics based on messages
  useEffect(() => {
    if (messages.length === 0) {
      setStats(prev => ({
        ...prev,
        totalMessages: 0,
        userMessages: 0,
        aiMessages: 0,
        averageAIResponseTime: 0,
        messageCounts: {
          total: 0,
          user: 0,
          ai: 0
        },
        tokenUsage: {
          total: 0,
          prompt: 0,
          completion: 0
        },
        totalPromptTokens: 0,
        totalCompletionTokens: 0,
        totalCost: 0,
      }));
      return;
    }

    const userMsgs = messages.filter(m => m.sender === 'user');
    const aiMsgs = messages.filter(m => m.sender === 'ai' && !m.isNotification);
    const pairs = [];
    
    // Calculate response times
    for (let i = 0; i < userMsgs.length; i++) {
      const userMsg = userMsgs[i];
      const aiResponse = messages.find(m => 
        m.sender === 'ai' && 
        !m.isNotification &&
        new Date(m.timestamp) > new Date(userMsg.timestamp) &&
        (i === userMsgs.length - 1 || new Date(m.timestamp) < new Date(userMsgs[i+1].timestamp))
      );
      
      if (aiResponse) {
        const userTime = new Date(userMsg.timestamp);
        const aiTime = new Date(aiResponse.timestamp);
        const responseTime = (aiTime.getTime() - userTime.getTime()) / 1000; // in seconds
        pairs.push({ userMsg, aiResponse, responseTime });
      }
    }
    
    // Calculate total tokens and cost
    let totalPromptTokens = 0;
    let totalCompletionTokens = 0;
    let totalCost = 0;
    
    aiMsgs.forEach(msg => {
      if (msg.tokenUsage) {
        totalPromptTokens += msg.tokenUsage.promptTokens || 0;
        totalCompletionTokens += msg.tokenUsage.completionTokens || 0;
        totalCost += msg.tokenUsage.totalCost || 0;
      }
    });
    
    const avgResponseTime = pairs.length > 0 
      ? pairs.reduce((sum, pair) => sum + pair.responseTime, 0) / pairs.length 
      : 0;
    
    setStats({
      totalMessages: messages.length,
      userMessages: userMsgs.length,
      aiMessages: aiMsgs.length,
      averageAIResponseTime: avgResponseTime,
      messageCounts: {
        total: messages.length,
        user: userMsgs.length,
        ai: aiMsgs.length
      },
      tokenUsage: {
        total: totalPromptTokens + totalCompletionTokens,
        prompt: totalPromptTokens,
        completion: totalCompletionTokens
      },
      totalPromptTokens,
      totalCompletionTokens,
      totalCost,
      sessionStartTime: stats.sessionStartTime,
    });
    
  }, [messages]);

  // Helper function to format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate session duration
  const sessionDuration = Math.floor((new Date().getTime() - stats.sessionStartTime.getTime()) / 1000);
  
  const handleExport = () => {
    // Create a JSON object with all the chat data
    const exportData = {
      messages: messages,
      stats: stats,
      aiPersonality: aiPersonality,
      exportDate: new Date().toISOString(),
    };
    
    // Convert to a string
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a blob
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mark-manson-ai-chat-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification('Chat data exported successfully', 'success');
  };

  const estimateTokens = (text: string) => {
    // Simple token estimation, replace with actual token count if available
    return text.split(' ').length;
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>Mark Manson AI - Admin Panel</h2>
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeAdminTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('analytics')}
          >
            Analytics
          </button>
          <button 
            className={`admin-tab ${activeAdminTab === 'prompts' ? 'active' : ''}`}
            onClick={() => setActiveAdminTab('prompts')}
          >
            Prompt Testing
          </button>
        </div>
        <div className="admin-actions">
          <button 
            className="export-button" 
            onClick={handleExport}
            disabled={messages.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            <span>Export Data</span>
          </button>
          
          <button 
            className="clear-data-button" 
            onClick={clearChat}
            disabled={messages.length === 0}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            <span>Clear Data</span>
          </button>
        </div>
      </div>
      
      <div className="admin-content">
        {activeAdminTab === 'analytics' ? (
          <>
            <div className="stats-grid">
              <div className="stat-card session-info">
                <h3>Session Information</h3>
                <div className="stat-item">
                  <div className="stat-label">Session Duration</div>
                  <div className="stat-value">{formatDuration(sessionDuration)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Current Mode</div>
                  <div className="stat-value">{aiPersonality === 'friendly' ? 'Friendly' : 'Challenger'}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Average Response Time</div>
                  <div className="stat-value">{stats.averageAIResponseTime.toFixed(2)} seconds</div>
                </div>
              </div>
              
              <div className="stat-card message-stats">
                <h3>Message Statistics</h3>
                <div className="stat-item">
                  <div className="stat-label">Total Messages</div>
                  <div className="stat-value">{stats.messageCounts.total}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">User Messages</div>
                  <div className="stat-value">{stats.messageCounts.user}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">AI Messages</div>
                  <div className="stat-value">{stats.messageCounts.ai}</div>
                </div>
              </div>
              
              <div className="stat-card token-stats">
                <h3>Token Usage</h3>
                <div className="stat-item">
                  <div className="stat-label">Total Tokens</div>
                  <div className="stat-value">{stats.tokenUsage.total}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Input Tokens</div>
                  <div className="stat-value">{stats.tokenUsage.prompt}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Output Tokens</div>
                  <div className="stat-value">{stats.tokenUsage.completion}</div>
                </div>
              </div>

              <div className="stat-card cost-stats">
                <h3>Estimated Cost</h3>
                <div className="stat-item">
                  <div className="stat-label">Total Cost</div>
                  <div className="stat-value">${(stats.tokenUsage.total * 0.00001).toFixed(4)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Input Cost</div>
                  <div className="stat-value">${(stats.tokenUsage.prompt * 0.000005).toFixed(4)}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-label">Output Cost</div>
                  <div className="stat-value">${(stats.tokenUsage.completion * 0.000015).toFixed(4)}</div>
                </div>
              </div>
            </div>
            
            <div className="message-analysis">
              <h3>Message History</h3>
              {messages.length > 0 ? (
                <table className="messages-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Timestamp</th>
                      <th style={{ width: '15%' }}>Sender</th>
                      <th style={{ width: '45%' }}>Content</th>
                      <th style={{ width: '20%' }}>Tokens</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.slice().reverse().map((msg, idx) => (
                      <tr key={idx} className={msg.sender === 'ai' ? 'ai-row' : 'user-row'}>
                        <td>{new Date(msg.timestamp).toLocaleTimeString()}</td>
                        <td>{msg.sender === 'ai' ? 'AI' : 'User'}</td>
                        <td className="message-content">{msg.text}</td>
                        <td>{estimateTokens(msg.text)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-messages">
                  No messages in the current session. Start a conversation to see analytics.
                </div>
              )}
            </div>
          </>
        ) : (
          <PromptTester />
        )}
      </div>
    </div>
  );
}
