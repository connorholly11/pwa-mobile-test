// Function to convert a base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check if notifications are supported
export function areNotificationsSupported(): boolean {
  return (
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  );
}

// Check notification permission status
export function getNotificationPermissionStatus(): NotificationPermission | null {
  if (!areNotificationsSupported()) {
    return null;
  }
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!areNotificationsSupported()) {
    console.warn('Notifications are not supported in this browser');
    return 'denied';
  }
  
  return await Notification.requestPermission();
}

// Register for push notifications
export async function subscribeToPushNotifications(publicVapidKey: string): Promise<PushSubscription | null> {
  if (!areNotificationsSupported()) {
    console.warn('Push notifications are not supported in this browser');
    return null;
  }

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('Service Worker registered');

    // Check permission
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return null;
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });

    console.log('Push notification subscription:', subscription);
    
    // Here you would typically send this subscription to your server
    // to store it for future push notifications
    // await sendSubscriptionToServer(subscription);
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

// Unsubscribe from push notifications
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      return false;
    }

    const subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      return false;
    }

    const success = await subscription.unsubscribe();
    
    // Here you would typically notify your server about the unsubscription
    // await removeSubscriptionFromServer(subscription);
    
    return success;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

// Check if the device is iOS
export function isIOS(): boolean {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || 
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
}

// Check if the iOS version is 16.4 or higher (required for PWA notifications)
export function isIOSVersionSupported(): boolean {
  if (!isIOS()) return false;
  
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/OS (\d+)_(\d+)/);
  
  if (!match) return false;
  
  const majorVersion = parseInt(match[1], 10);
  const minorVersion = parseInt(match[2], 10);
  
  return (majorVersion > 16) || (majorVersion === 16 && minorVersion >= 4);
}

// Check if PWA is installed (added to home screen)
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as unknown as { standalone?: boolean }).standalone === true;
}

// Show a demo notification (for testing)
export function showDemoNotification(): void {
  if (!areNotificationsSupported() || Notification.permission !== 'granted') {
    console.warn('Notifications not supported or permission not granted');
    return;
  }
  
  navigator.serviceWorker.ready.then(registration => {
    // Adding custom vibration is supported on some platforms but not in the standard type
    // Using object spread to include it without TypeScript errors
    const options: NotificationOptions & { vibrate?: number[] } = {
      body: 'This is a test notification from your Todo PWA',
      icon: '/icons/icon-192x192.svg',
      data: {
        url: window.location.href
      },
      vibrate: [100, 50, 100]
    };
    
    registration.showNotification('Demo Notification', options);
  });
}

// Send a delayed notification through the server API
export async function sendDelayedNotification(
  subscription: PushSubscription | null,
  delayMs: number = 10000,
  title: string = 'Delayed Notification',
  body: string = 'This notification was scheduled to arrive after a delay.'
): Promise<boolean> {
  if (!subscription) {
    console.warn('No push subscription available');
    return false;
  }

  try {
    const response = await fetch('/api/send-notification', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription,
        delay: delayMs,
        title,
        body,
        url: window.location.href,
      }),
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to schedule notification');
    }
    
    return true;
  } catch (error) {
    console.error('Error scheduling delayed notification:', error);
    return false;
  }
} 