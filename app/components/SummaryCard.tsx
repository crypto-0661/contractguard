/**
 * ContractGuard - 合同摘要卡片组件
 * 功能：展示AI生成的合同摘要、风险评分、建议
 */

'use client';

import type { RiskDistribution } from '@/types';

interface SummaryCardProps {
  summary: string;
  overallScore: number;
  riskDistribution: RiskDistribution;
  recommendations: Array<{ id: string; action: string; priority: string }>;
  missingClauses: Array<{ id: string; clauseName: string; importance: string }>;
}

export default function SummaryCard({
  summary,
  overallScore,
  riskDistribution,
  recommendations,
  missingClauses,
}: SummaryCardProps) {
  const getScoreColor = (score: number): string => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
        return 'badge-low';
      default:
        return 'badge-info';
    }
  };

  const totalRisks = Object.values(riskDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* 摘要 */}
      <div className="card-padded">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          AI Executive Summary
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-extrabold ${getScoreColor(overallScore)}`}>
              {overallScore.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">/10 Risk Score</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <span className="text-lg font-bold text-gray-900">{totalRisks}</span>
            <span className="text-sm text-gray-500 ml-1">Total Risk Items</span>
          </div>
          <div className="h-8 w-px bg-gray-200" />
          <div>
            <span className="text-lg font-bold text-gray-900">{recommendations.length}</span>
            <span className="text-sm text-gray-500 ml-1">Recommendations</span>
          </div>
        </div>
      </div>

      {/* 推荐操作 */}
      {recommendations.length > 0 && (
        <div className="card-padded">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Recommended Actions
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec) => (
              <div key={rec.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900">{rec.action}</span>
                    <span className={getPriorityBadge(rec.priority)}>{rec.priority}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 缺失条款 */}
      {missingClauses.length > 0 && (
        <div className="card-padded border-yellow-200 bg-yellow-50/50">
          <h3 className="text-sm font-semibold text-yellow-800 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Missing Protective Clauses ({missingClauses.length})
          </h3>
          <div className="space-y-2">
            {missingClauses.map((clause) => (
              <div
                key={clause.id}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-yellow-100/50 transition-colors"
              >
                <span className={getPriorityBadge(clause.importance)}>{clause.importance}</span>
                <span className="text-sm text-gray-800 font-medium">{clause.clauseName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
