'use client';

import { Message } from '../contexts/ChatContext';
import { formatTimeAgo } from '../utils/formatTimeAgo';

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <div className={`chat-bubble ${message.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
      <div className="bubble-content">
        <p>{message.text}</p>
      </div>
      <div className="bubble-timestamp">
        {formatTimeAgo(new Date(message.timestamp))}
      </div>
    </div>
  );
} 