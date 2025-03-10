'use client';

import React, { useState, useEffect } from 'react';
import { getChatResponse, DeepSeekMessage } from '../utils/deepSeekApi';
import { useUINotifications } from '../contexts/UINotificationContext';

// Define the type for saved prompts
interface SavedPrompt {
  id: string;
  systemPrompt: string;
  userPrompt: string;
  timestamp: number;
  response?: string;
}

const PromptTester = () => {
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful assistant.');
  const [userPrompt, setUserPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenUsage, setTokenUsage] = useState<{
    promptTokens: number;
    completionTokens: number;
    totalCost: number;
    pricingType?: string;
  } | null>(null);
  
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const { addNotification } = useUINotifications();

  // Load saved prompts from localStorage when component mounts
  useEffect(() => {
    const savedPromptsFromStorage = localStorage.getItem('savedPrompts');
    if (savedPromptsFromStorage) {
      try {
        const parsedPrompts = JSON.parse(savedPromptsFromStorage);
        setSavedPrompts(parsedPrompts);
      } catch (error) {
        console.error('Error parsing saved prompts from localStorage:', error);
      }
    }
  }, []);

  // Save current test to localStorage
  const savePromptTest = (testResponse: string) => {
    const newPrompt: SavedPrompt = {
      id: Date.now().toString(),
      systemPrompt,
      userPrompt,
      timestamp: Date.now(),
      response: testResponse
    };
    
    const updatedPrompts = [newPrompt, ...savedPrompts].slice(0, 20); // Keep only the 20 most recent tests
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
  };

  // Load a saved prompt
  const loadSavedPrompt = (savedPrompt: SavedPrompt) => {
    setSystemPrompt(savedPrompt.systemPrompt);
    setUserPrompt(savedPrompt.userPrompt);
    if (savedPrompt.response) {
      setResponse(savedPrompt.response);
    }
    setShowHistory(false);
    addNotification('Loaded saved prompt', 'success');
  };

  // Delete a saved prompt
  const deleteSavedPrompt = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click on the parent element
    const updatedPrompts = savedPrompts.filter(prompt => prompt.id !== id);
    setSavedPrompts(updatedPrompts);
    localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
    addNotification('Deleted saved prompt', 'success');
  };

  const handleTest = async () => {
    if (!userPrompt.trim()) {
      addNotification('Please enter a user prompt to test', 'error');
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    
    try {
      // Create a simple conversation with just a system message and user message
      const apiMessages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];
      
      console.log('🧪 Testing prompt with messages:', apiMessages);
      
      const apiResponse = await getChatResponse(apiMessages);
      
      setResponse(apiResponse.content);
      
      if (apiResponse.usage) {
        setTokenUsage(apiResponse.usage);
      }
      
      // Save this successful test to history
      savePromptTest(apiResponse.content);
      
      addNotification('Prompt test completed successfully', 'success');
    } catch (error) {
      console.error('❌ Error testing prompt:', error);
      if (error instanceof Error) {
        setResponse(`Error: ${error.message}`);
        addNotification(`Error testing prompt: ${error.message}`, 'error');
      } else {
        setResponse('An unknown error occurred');
        addNotification('An unknown error occurred while testing the prompt', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="prompt-tester">
      <h3>Prompt Testing Interface</h3>
      <p className="prompt-tester-description">
        Test prompts directly with the AI model without affecting your chat history.
      </p>
      
      <div className="prompt-history-buttons">
        <button 
          className="history-toggle-button"
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Hide History' : 'Show History'}
        </button>
      </div>
      
      {showHistory && savedPrompts.length > 0 && (
        <div className="prompt-history">
          <h4>Previous Tests</h4>
          <div className="prompt-history-list">
            {savedPrompts.map((prompt) => (
              <div key={prompt.id} className="saved-prompt-item" onClick={() => loadSavedPrompt(prompt)}>
                <div className="saved-prompt-header">
                  <span className="saved-prompt-timestamp">{formatDate(prompt.timestamp)}</span>
                  <button
                    className="delete-prompt-button"
                    onClick={(e) => deleteSavedPrompt(prompt.id, e)}
                    aria-label="Delete prompt"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="saved-prompt-preview">
                  <p className="saved-prompt-text">{prompt.userPrompt.slice(0, 100)}{prompt.userPrompt.length > 100 ? '...' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="prompt-tester-inputs">
        <div className="input-group">
          <label htmlFor="systemPrompt">System Prompt</label>
          <textarea
            id="systemPrompt"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            rows={4}
            placeholder="Enter system instructions here..."
            disabled={isLoading}
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="userPrompt">User Prompt</label>
          <textarea
            id="userPrompt"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={4}
            placeholder="Enter user prompt here..."
            disabled={isLoading}
          />
        </div>
        
        <button 
          className="test-prompt-button" 
          onClick={handleTest}
          disabled={isLoading}
        >
          {isLoading ? 'Testing...' : 'Test Prompt'}
        </button>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">
          <p>Testing prompt, please wait...</p>
        </div>
      )}
      
      {response && (
        <div className="prompt-tester-results">
          <div className="result-section">
            <h4>AI Response</h4>
            <div className="response-content">{response}</div>
          </div>
          
          {tokenUsage && (
            <div className="token-usage">
              <h4>Token Usage</h4>
              <div className="token-stats">
                <div className="token-stat">
                  <span className="token-stat-label">Input Tokens:</span>
                  <span className="token-stat-value">{tokenUsage.promptTokens.toLocaleString()}</span>
                </div>
                <div className="token-stat">
                  <span className="token-stat-label">Output Tokens:</span>
                  <span className="token-stat-value">{tokenUsage.completionTokens.toLocaleString()}</span>
                </div>
                <div className="token-stat">
                  <span className="token-stat-label">Total Tokens:</span>
                  <span className="token-stat-value">{(tokenUsage.promptTokens + tokenUsage.completionTokens).toLocaleString()}</span>
                </div>
                <div className="token-stat">
                  <span className="token-stat-label">Cost:</span>
                  <span className="token-stat-value">${tokenUsage.totalCost.toFixed(6)}</span>
                </div>
                {tokenUsage.pricingType && (
                  <div className="token-stat">
                    <span className="token-stat-label">Pricing:</span>
                    <span className="token-stat-value">{tokenUsage.pricingType}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptTester;
