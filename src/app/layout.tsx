import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { NotificationProvider } from './contexts/NotificationContext';
import { UINotificationProvider } from './contexts/UINotificationContext';
import { UINotification } from './components/UINotification';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Todo PWA',
  description: 'A progressive web app todo list for iPhone',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.svg' },
      { url: '/icons/icon-192x192.svg' },
      { url: '/icons/icon.svg' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.svg' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Todo PWA',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="Todo PWA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Todo PWA" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#4285f4" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          <UINotificationProvider>
            {children}
            <UINotification />
          </UINotificationProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
