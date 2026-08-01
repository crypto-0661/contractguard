'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Contracts Reviewed', value: '0', icon: '📄' },
          { label: 'Risk Alerts', value: '0', icon: '⚠️' },
          { label: 'Avg Risk Score', value: '-', icon: '📊' },
          { label: 'Plan', value: 'Free', icon: '💎' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-gray-500 text-sm">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-semibold mb-4">Upload Your First Contract</h2>
        <p className="text-gray-500 mb-6">Get AI-powered risk analysis in minutes.</p>
        <Link href="/upload" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Upload Contract →</Link>
      </div>
    </div>
  );
}
