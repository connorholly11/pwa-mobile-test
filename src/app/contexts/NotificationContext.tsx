'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  areNotificationsSupported, 
  getNotificationPermissionStatus, 
  requestNotificationPermission, 
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  showDemoNotification,
  isIOS,
  isIOSVersionSupported,
  isPWAInstalled
} from '../utils/notifications';

// The public VAPID key should come from your server environment
// For development, you can generate one at https://web-push-codelab.glitch.me/
const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'YOUR_PUBLIC_VAPID_KEY';

type NotificationContextType = {
  isNotificationsSupported: boolean;
  isIOS: boolean;
  isIOSVersionSupported: boolean;
  isPWAInstalled: boolean;
  notificationPermission: NotificationPermission | null;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
  showTestNotification: () => void;
  iOSNotificationsAvailable: boolean;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isNotificationsSupported, setIsNotificationsSupported] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isIOSSupported, setIsIOSSupported] = useState(false);
  const [isPWAAddedToHomeScreen, setIsPWAAddedToHomeScreen] = useState(false);
  
  // Check if iOS notifications are available (iOS 16.4+, installed to home screen, and notifications supported)
  const iOSNotificationsAvailable = isIOSDevice && isIOSSupported && isPWAAddedToHomeScreen && isNotificationsSupported;

  // Initialize on first render
  useEffect(() => {
    const initializeNotifications = async () => {
      if (typeof window !== 'undefined') {
        const supported = areNotificationsSupported();
        setIsNotificationsSupported(supported);
        setIsIOSDevice(isIOS());
        setIsIOSSupported(isIOSVersionSupported());
        setIsPWAAddedToHomeScreen(isPWAInstalled());
        
        if (supported) {
          const permission = getNotificationPermissionStatus();
          setNotificationPermission(permission);
          
          // Check if we already have a subscription
          if (permission === 'granted') {
            try {
              const registration = await navigator.serviceWorker.getRegistration();
              if (registration) {
                const existingSubscription = await registration.pushManager.getSubscription();
                setSubscription(existingSubscription);
              }
            } catch (error) {
              console.error('Error checking for existing push subscription:', error);
            }
          }
        }
      }
    };

    initializeNotifications();
  }, []);

  // Request permission for notifications
  const requestPermission = async () => {
    const permission = await requestNotificationPermission();
    setNotificationPermission(permission);
    return permission;
  };

  // Subscribe to push notifications
  const subscribe = async () => {
    const sub = await subscribeToPushNotifications(PUBLIC_VAPID_KEY);
    if (sub) {
      setSubscription(sub);
    }
    return sub;
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    const success = await unsubscribeFromPushNotifications();
    if (success) {
      setSubscription(null);
    }
    return success;
  };

  // Show a test notification
  const showTestNotification = () => {
    showDemoNotification();
  };

  const value = {
    isNotificationsSupported,
    isIOS: isIOSDevice,
    isIOSVersionSupported: isIOSSupported,
    isPWAInstalled: isPWAAddedToHomeScreen,
    notificationPermission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    showTestNotification,
    iOSNotificationsAvailable
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
} 