import './globals.css';

import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'Web App around the game "The First Descendent"',
  description: 'A web app around the game "The First Descendent".'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen w-full flex-col">{children}</body>
      <Analytics />
    </html>
  );
}
