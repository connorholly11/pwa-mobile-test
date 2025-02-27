'use client';

import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { sendDelayedNotification } from '../utils/notifications';

type NotificationButtonProps = {
  className?: string;
};

export default function NotificationButton({ className = '' }: NotificationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scheduledNotification, setScheduledNotification] = useState(false);
  const {
    isNotificationsSupported,
    notificationPermission,
    requestPermission,
    subscribe,
    unsubscribe,
    subscription,
    showTestNotification,
    isIOS,
    isIOSVersionSupported,
    isPWAInstalled
  } = useNotifications();

  // Handle enabling notifications
  const handleEnableNotifications = async () => {
    if (!isNotificationsSupported) {
      alert('Push notifications are not supported in your browser.');
      return;
    }

    if (isIOS && !isPWAInstalled) {
      alert('To enable notifications on iOS, you must first add this app to your home screen.');
      return;
    }

    if (isIOS && !isIOSVersionSupported) {
      alert('Your iOS version does not support push notifications for web apps. iOS 16.4 or higher is required.');
      return;
    }

    setIsLoading(true);
    try {
      // Request permission if not already granted
      if (notificationPermission !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') {
          alert('Notification permission was not granted.');
          setIsLoading(false);
          return;
        }
      }

      // Subscribe to push notifications
      const result = await subscribe();
      if (!result) {
        alert('Failed to subscribe to push notifications.');
      }
    } catch (error) {
      console.error('Error enabling notifications:', error);
      alert('An error occurred while enabling notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle disabling notifications
  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      const success = await unsubscribe();
      if (!success) {
        alert('Failed to unsubscribe from push notifications.');
      }
    } catch (error) {
      console.error('Error disabling notifications:', error);
      alert('An error occurred while disabling notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle test notification
  const handleTestNotification = () => {
    showTestNotification();
  };

  // Handle delayed test notification
  const handleDelayedNotification = async () => {
    setIsLoading(true);
    try {
      // Send a notification that will appear in 10 seconds
      const success = await sendDelayedNotification(
        subscription,
        10000, // 10 seconds
        '⏱️ Delayed Notification',
        'This notification was scheduled 10 seconds ago. Did it arrive on time?'
      );
      
      if (success) {
        setScheduledNotification(true);
        setTimeout(() => setScheduledNotification(false), 11000); // Reset after 11 seconds
      } else {
        alert('Failed to schedule the delayed notification.');
      }
    } catch (error) {
      console.error('Error scheduling delayed notification:', error);
      alert('An error occurred while scheduling the notification.');
    } finally {
      setIsLoading(false);
    }
  };

  // If notifications are not supported at all
  if (!isNotificationsSupported) {
    return (
      <div className={`${className} text-sm text-gray-500 p-2 rounded bg-gray-100`}>
        Push notifications are not supported in your browser.
      </div>
    );
  }

  // iOS-specific message for users who haven't installed the PWA
  if (isIOS && !isPWAInstalled) {
    return (
      <div className={`${className} p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm`}>
        <p className="font-medium text-blue-800 mb-1">Enable Notifications</p>
        <p className="text-blue-700">
          To receive notifications on iOS, first add this app to your home screen.
          <br />
          Tap the share icon <span className="inline-block">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="inline mx-1">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
          </span> and select &quot;Add to Home Screen&quot;.
        </p>
      </div>
    );
  }

  // iOS-specific message for unsupported versions
  if (isIOS && !isIOSVersionSupported) {
    return (
      <div className={`${className} p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm`}>
        <p className="font-medium text-yellow-800">iOS Version Not Supported</p>
        <p className="text-yellow-700">
          Your iOS device must be on iOS 16.4 or later to receive web notifications.
        </p>
      </div>
    );
  }

  // Based on current permission state
  switch (notificationPermission) {
    case 'denied':
      return (
        <div className={`${className} p-3 bg-red-50 border border-red-200 rounded-lg text-sm`}>
          <p className="font-medium text-red-800">Notifications Blocked</p>
          <p className="text-red-700 mb-2">
            You&apos;ve blocked notifications for this site. To receive notifications, you&apos;ll need to enable them in your browser settings.
          </p>
        </div>
      );

    case 'granted':
      return (
        <div className={`${className} space-y-2`}>
          {subscription ? (
            <>
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                <p className="font-medium text-green-800">Notifications Enabled</p>
                <p className="text-green-700">
                  You will receive important notifications from this app.
                </p>
                {scheduledNotification && (
                  <p className="mt-2 text-blue-700 font-medium">
                    ⏱️ Notification scheduled! It will arrive in 10 seconds.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition"
                  disabled={isLoading}
                >
                  Instant Test
                </button>
                <button
                  onClick={handleDelayedNotification}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm transition"
                  disabled={isLoading || scheduledNotification}
                >
                  {scheduledNotification ? 'Notification Scheduled...' : 'Test (10s Delay)'}
                </button>
                <button
                  onClick={handleDisableNotifications}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm transition"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Disable Notifications'}
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Enable Notifications'}
            </button>
          )}
        </div>
      );

    default: // default includes 'default' permission state
      return (
        <div className={`${className} space-y-2`}>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-medium text-blue-800">Stay Updated</p>
            <p className="text-blue-700">
              Enable notifications to receive important updates and alerts from this app.
              {isIOS && ' On iOS, notifications will only work when the app is installed to your home screen.'}
            </p>
          </div>
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm transition"
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : 'Enable Notifications'}
          </button>
        </div>
      );
  }
} 