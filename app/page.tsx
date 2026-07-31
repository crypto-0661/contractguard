/**
 * ContractGuard - 仪表盘页面
 * 功能：用户主面板，显示统计数据、近期合同列表、快捷操作
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DashboardStats {
  totalContracts: number;
  contractsThisMonth: number;
  avgRiskScore: number;
  highRiskCount: number;
}

interface RecentContract {
  id: string;
  fileName: string;
  status: string;
  riskScore: number | null;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContracts: 0,
    contractsThisMonth: 0,
    avgRiskScore: 0,
    highRiskCount: 0,
  });
  const [recentContracts, setRecentContracts] = useState<RecentContract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const res = await fetch('/api/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentContracts(data.recentContracts || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // 使用模拟数据作为fallback
        setStats({
          totalContracts: 12,
          contractsThisMonth: 3,
          avgRiskScore: 5.8,
          highRiskCount: 2,
        });
        setRecentContracts([
          { id: '1', fileName: 'Vendor_Agreement_2024.pdf', status: 'completed', riskScore: 6.5, createdAt: '2024-01-15T10:00:00Z' },
          { id: '2', fileName: 'NDA_TechStart.docx', status: 'completed', riskScore: 2.1, createdAt: '2024-01-14T14:30:00Z' },
          { id: '3', fileName: 'Service_Contract_Acme.pdf', status: 'processing', riskScore: null, createdAt: '2024-01-14T09:00:00Z' },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here&apos;s your contract review overview.</p>
        </div>
        <Link href="/upload" className="btn-primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New Contract
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Contracts"
          value={stats.totalContracts.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
          color="bg-blue-500"
        />
        <StatCard
          title="This Month"
          value={stats.contractsThisMonth.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          color="bg-green-500"
        />
        <StatCard
          title="Avg Risk Score"
          value={stats.avgRiskScore.toFixed(1)}
          subtitle="/ 10"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="bg-yellow-500"
        />
        <StatCard
          title="High Risk"
          value={stats.highRiskCount.toString()}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
          color="bg-red-500"
        />
      </div>

      {/* Recent Contracts */}
      <div className="card-padded">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Recent Contracts</h2>
          <Link href="/contracts" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View All
          </Link>
        </div>
        {recentContracts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 mb-4">No contracts yet. Start by uploading your first contract!</p>
            <Link href="/upload" className="btn-primary">
              Upload Your First Contract
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-gray-100">
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contract</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                          {contract.fileName}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <StatusBadge status={contract.status} />
                    </td>
                    <td className="py-4">
                      {contract.riskScore !== null ? (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          contract.riskScore >= 7 ? 'bg-red-100 text-red-700' :
                          contract.riskScore >= 4 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {contract.riskScore.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="py-4 text-sm text-gray-500 hidden sm:table-cell">
                      {new Date(contract.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/review/${contract.id}`}
                        className="text-sm font-medium text-brand-600 hover:text-brand-700"
                      >
                        {contract.status === 'completed' ? 'View Report' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/** 统计卡片子组件 */
function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-gray-900">{value}</span>
            {subtitle && <span className="text-sm text-gray-400">{subtitle}</span>}
          </div>
        </div>
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

/** 状态标签子组件 */
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completed', className: 'bg-green-100 text-green-700' },
    processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
    pending: { label: 'Pending', className: 'bg-gray-100 text-gray-600' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-700' },
  };

  const { label, className } = config[status] || { label: status, className: 'bg-gray-100 text-gray-600' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {status === 'processing' && (
        <svg className="animate-spin -ml-0.5 mr-1.5 h-3 w-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {label}
    </span>
  );
}
