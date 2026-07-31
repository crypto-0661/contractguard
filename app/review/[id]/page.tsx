/**
 * ContractGuard - 审阅结果页面 /review/[id]
 * 功能：展示AI审阅结果、风险仪表盘、条款高亮、谈判建议
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import RiskDashboard from '../../components/RiskDashboard';
import ClauseHighlighter from '../../components/ClauseHighlighter';
import SummaryCard from '../../components/SummaryCard';
import type { ReviewResult } from '@/types';

type TabType = 'overview' | 'risks' | 'contract' | 'negotiation';

export default function ReviewPage() {
  const params = useParams();
  const contractId = params?.id as string;

  const [review, setReview] = useState<ReviewResult | null>(null);
  const [contractName, setContractName] = useState<string>('Loading...');
  const [contractText, setContractText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  useEffect(() => {
    async function fetchReview() {
      if (!contractId) return;

      try {
        const res = await fetch(`/api/review?contractId=${contractId}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to load review');
        }
        const data = await res.json();
        setReview(data.review);
        setContractName(data.contractName || 'Contract');
        setContractText(data.contractText || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load review');
      } finally {
        setLoading(false);
      }
    }

    fetchReview();
  }, [contractId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-40 bg-gray-200 rounded-2xl" />
            <div className="lg:col-span-2 h-40 bg-gray-200 rounded-2xl" />
          </div>
          <div className="h-96 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review Not Found</h2>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link href="/upload" className="btn-primary">
          Upload a New Contract
        </Link>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Analyzing Your Contract</h2>
        <p className="text-gray-500">AI is reviewing your contract. This may take a few minutes...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/dashboard"
              className="text-sm text-gray-500 hover:text-brand-600 transition-colors"
            >
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-sm text-gray-900 font-medium truncate">{contractName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Review Report</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/upload" className="btn-secondary text-sm !py-2 !px-4">
            Review Another
          </Link>
          <button
            onClick={() => window.print()}
            className="btn-ghost text-sm !py-2 !px-4"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {([
          { key: 'overview', label: 'Overview', icon: '📊' },
          { key: 'risks', label: `Risks (${review.risks.length})`, icon: '⚠️' },
          { key: 'contract', label: 'Contract Text', icon: '📄' },
          { key: 'negotiation', label: 'Negotiation Tips', icon: '💬' },
        ] as { key: TabType; label: string; icon: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
              ${
                activeTab === tab.key
                  ? 'border-brand-600 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SummaryCard
              summary={review.summary}
              overallScore={review.overallScore}
              riskDistribution={review.riskDistribution}
              recommendations={review.recommendations}
              missingClauses={review.missingClauses}
            />
            <RiskDashboard review={review} contractName={contractName} />
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-4">
            {review.risks.map((risk) => (
              <div
                key={risk.id}
                className="card-padded hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                        risk.level === 'high'
                          ? 'bg-red-500'
                          : risk.level === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900">{risk.title}</h3>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            risk.level === 'high'
                              ? 'bg-red-100 text-red-700'
                              : risk.level === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {risk.level.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {risk.section} · Line {risk.lineNumber} · {risk.category}
                      </p>
                      <blockquote className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-300 pl-3 bg-gray-50 p-2 rounded-r">
                        &ldquo;{risk.originalText}&rdquo;
                      </blockquote>
                      <div className="mt-3 space-y-2">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-xs font-semibold text-red-800 mb-1">⚠ Problem</p>
                          <p className="text-sm text-red-700">{risk.problem}</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                          <p className="text-xs font-semibold text-green-800 mb-1">✅ Suggestion</p>
                          <p className="text-sm text-green-700">{risk.suggestion}</p>
                        </div>
                        {risk.suggestedRevision && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <p className="text-xs font-semibold text-blue-800 mb-1">📝 Suggested Revision</p>
                            <p className="text-sm text-blue-700 font-mono">{risk.suggestedRevision}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'contract' && contractText && (
          <ClauseHighlighter risks={review.risks} contractText={contractText} />
        )}

        {activeTab === 'negotiation' && (
          <div className="space-y-4">
            {review.negotiationTips.length > 0 ? (
              review.negotiationTips.map((tip) => (
                <div key={tip.id} className="card-padded">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                          {tip.category}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 mb-2">{tip.strategy}</p>
                      {tip.talkingPoints.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Talking Points:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {tip.talkingPoints.map((point, i) => (
                              <li key={i} className="text-sm text-gray-600">{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {tip.fallbackPosition && (
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <p className="text-xs font-semibold text-gray-700 mb-0.5">Fallback Position:</p>
                          <p className="text-sm text-gray-600">{tip.fallbackPosition}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No negotiation tips available for this contract.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
