/**
 * 仪表盘布局 — 带Navbar + SessionProvider
 */
'use client';

import { SessionProvider } from 'next-auth/react';
import Navbar from '../../components/Navbar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="pt-16">{children}</main>
      </div>
    </SessionProvider>
  );
}
