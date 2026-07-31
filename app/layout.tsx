/**
 * ContractGuard - 根布局组件
 * 功能：全局HTML结构、字体加载、metadata
 */

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'clausescan — AI-Powered Contract Review for Small Businesses',
  description:
    'Catch hidden risks before you sign. AI-powered contract review built for small businesses.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
