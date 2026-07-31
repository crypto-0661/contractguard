/**
 * ContractGuard - 风险仪表盘组件
 * 功能：圆环评分图（纯CSS）、风险分布柱状图、高风险条款列表
 */

'use client';

import type { ReviewResult, RiskDistribution, RISK_CATEGORY_LABELS } from '@/types';
import { RiskCategory } from '@/types';

const RISK_CATEGORY_LABELS: Record<string, string> = {
  liability: 'Liability',
  payment: 'Payment',
  termination: 'Termination',
  intellectual_property: 'IP',
  confidentiality: 'Confidentiality',
  non_compete: 'Non-Compete',
};

const CATEGORY_COLORS: Record<string, string> = {
  liability: '#ef4444',
  payment: '#f59e0b',
  termination: '#8b5cf6',
  intellectual_property: '#3b82f6',
  confidentiality: '#06b6d4',
  non_compete: '#10b981',
};

interface RiskDashboardProps {
  review: ReviewResult;
  contractName: string;
}

export default function RiskDashboard({ review, contractName }: RiskDashboardProps) {
  const { overallScore, summary, risks, riskDistribution, recommendations } = review;

  const getScoreColor = (score: number): string => {
    if (score <= 3) return '#22c55e';
    if (score <= 6) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score: number): string => {
    if (score <= 3) return 'Low Risk';
    if (score <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  const getScoreDescription = (score: number): string => {
    if (score <= 3) return 'This contract appears well-balanced with minimal concerning clauses.';
    if (score <= 6) return 'This contract has some areas of concern that warrant attention before signing.';
    return 'This contract contains significant risks. We recommend legal review before proceeding.';
  };

  // 圆环图计算
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const scoreOffset = circumference - (overallScore / 10) * circumference;

  // 风险分布最大值
  const maxDistValue = Math.max(
    ...Object.values(riskDistribution),
    1
  );

  return (
    <div className="space-y-8">
      {/* 顶部：风险评分 + 摘要 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 圆环评分图 */}
        <div className="card-padded flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Overall Risk Score
          </h3>
          <div className="relative w-36 h-36">
            {/* 背景圆环 */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="10"
              />
              {/* 前景圆环 */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                fill="none"
                stroke={getScoreColor(overallScore)}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={scoreOffset}
                className="ring-chart"
              />
            </svg>
            {/* 中心文字 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="text-4xl font-extrabold"
                style={{ color: getScoreColor(overallScore) }}
              >
                {overallScore.toFixed(1)}
              </span>
              <span className="text-xs text-gray-400">/ 10</span>
            </div>
          </div>
          <div
            className="mt-3 px-3 py-1 rounded-full text-sm font-semibold"
            style={{
              backgroundColor: getScoreColor(overallScore) + '20',
              color: getScoreColor(overallScore),
            }}
          >
            {getScoreLabel(overallScore)}
          </div>
          <p className="text-xs text-center text-gray-500 mt-2 max-w-[200px]">
            {getScoreDescription(overallScore)}
          </p>
        </div>

        {/* 摘要卡片 */}
        <div className="card-padded lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Contract Summary
          </h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-brand-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-900 truncate">{contractName}</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-info">
              {risks.length} Risk{risks.length !== 1 ? 's' : ''} Found
            </span>
            <span className="badge-info">
              {recommendations.length} Recommendation{recommendations.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* 中间：风险分布 */}
      <div className="card-padded">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
          Risk Distribution by Category
        </h3>
        <div className="space-y-4">
          {(Object.entries(riskDistribution) as [string, number][]).map(
            ([category, count]) => (
              <div key={category} className="flex items-center gap-3">
                <span className="w-24 text-xs font-medium text-gray-600 text-right flex-shrink-0">
                  {RISK_CATEGORY_LABELS[category] || category}
                </span>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: maxDistValue > 0 ? `${(count / maxDistValue) * 100}%` : '0%',
                      backgroundColor: CATEGORY_COLORS[category] || '#6b7280',
                    }}
                  />
                </div>
                <span className="w-8 text-xs font-semibold text-gray-700 text-left">
                  {count}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* 底部：高风险条款列表 */}
      {risks.length > 0 && (
        <div className="card-padded">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Key Risk Findings ({risks.length})
          </h3>
          <div className="space-y-3">
            {risks.slice(0, 10).map((risk) => (
              <div
                key={risk.id}
                className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div
                  className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                    risk.level === 'high'
                      ? 'bg-red-500'
                      : risk.level === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-gray-900">{risk.title}</h4>
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
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {RISK_CATEGORY_LABELS[risk.category] || risk.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {risk.section} {risk.lineNumber > 0 ? `· Line ${risk.lineNumber}` : ''}
                  </p>
                  <blockquote className="mt-2 text-xs text-gray-600 italic border-l-2 border-gray-300 pl-3 py-1 bg-gray-50 rounded-r">
                    {risk.originalText.length > 200
                      ? risk.originalText.substring(0, 200) + '...'
                      : risk.originalText}
                  </blockquote>
                  <p className="text-xs text-gray-700 mt-2">
                    <span className="font-semibold">Problem:</span> {risk.problem}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    <span className="font-semibold">Suggested Fix:</span> {risk.suggestion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
