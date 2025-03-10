'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  title?: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

interface UINotificationContextType {
  notifications: Notification[];
  addNotification: (message: string, type: NotificationType, title?: string, duration?: number) => void;
  removeNotification: (id: string) => void;
}

const UINotificationContext = createContext<UINotificationContextType | undefined>(undefined);

export function UINotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (message: string, type: NotificationType = 'info', title?: string, duration: number = 5000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newNotification = {
        id,
        message,
        type,
        title,
        duration,
      };

      setNotifications((prevNotifications) => [...prevNotifications, newNotification]);

      if (duration !== Infinity) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  }, []);

  return (
    <UINotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
    </UINotificationContext.Provider>
  );
}

export function useUINotifications() {
  const context = useContext(UINotificationContext);
  if (context === undefined) {
    throw new Error('useUINotifications must be used within a UINotificationProvider');
  }
  return context;
}
