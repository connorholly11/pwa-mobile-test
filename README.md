This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Push Notifications

This PWA supports push notifications on both Android and iOS. For iOS devices, push notifications are supported for PWAs starting with iOS 16.4.

### iOS Requirements

For push notifications to work on iOS:

1. The PWA must be added to the home screen (installed)
2. The device must be running iOS 16.4 or later
3. The PWA must be installed from Safari (not other browsers)
4. The user must grant notification permission

### Setup Instructions

1. Generate VAPID keys for Web Push:

```bash
# Install web-push globally
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

2. Add the keys to your `.env.local` file:

```
NEXT_PUBLIC_VAPID_KEY=YOUR_PUBLIC_VAPID_KEY
VAPID_PRIVATE_KEY=YOUR_PRIVATE_VAPID_KEY
VAPID_SUBJECT=mailto:your-email@example.com
```

3. Install the web-push package:

```bash
npm install web-push
```

4. Uncomment the implementation in `src/app/api/send-notification/route.ts` to enable sending notifications from your server.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
