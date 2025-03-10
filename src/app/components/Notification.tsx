'use client';

import React, { useState, useEffect } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

export default function Notification({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return isVisible ? (
    <div className={`notification ${type} ${isVisible ? 'show' : 'hide'}`}>
      <div className="notification-content">
        <span className="notification-message">{message}</span>
        <button 
          className="notification-close" 
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          aria-label="Close notification"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
    </div>
  ) : null;
}

// Component to manage multiple notifications
export function NotificationContainer() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    duration?: number;
  }>>([]);

  const addNotification = (
    message: string, 
    type: 'success' | 'info' | 'warning' | 'error', 
    duration = 3000
  ) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return {
    notificationComponent: (
      <div className="notification-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    ),
    addNotification,
    removeNotification
  };
}
