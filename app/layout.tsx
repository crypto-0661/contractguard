/**
 * ContractGuard - 根布局组件
 * 功能：全局HTML结构、字体加载、metadata
 */

import type { Metadata } from 'next';
import './globals.css';
import Navbar from './components/Navbar';

export const metadata: Metadata = {
  title: 'ContractGuard — AI-Powered Contract Review for Small Businesses',
  description:
    'Catch hidden risks before you sign. AI-powered contract review built for America\'s 33 million small businesses.',
  keywords: 'contract review, AI contract analysis, small business legal, risk assessment',
  openGraph: {
    title: 'ContractGuard — AI-Powered Contract Review',
    description: 'Catch hidden risks before you sign. Upload your contract and get AI-powered analysis in minutes.',
    type: 'website',
    url: 'https://contractguard.com',
  },
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
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
