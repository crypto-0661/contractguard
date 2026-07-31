/**
 * ContractGuard - 条款高亮组件
 * 功能：根据风险条款列表在合同原文中高亮标记相关段落
 */

'use client';

import { useState } from 'react';
import type { RiskClause } from '@/types';

interface ClauseHighlighterProps {
  risks: RiskClause[];
  contractText: string;
}

export default function ClauseHighlighter({ risks, contractText }: ClauseHighlighterProps) {
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  // 将合同文本按行分割
  const lines = contractText.split('\n');

  // 创建行号到风险的映射
  const riskLineMap = new Map<number, RiskClause[]>();
  risks.forEach((risk) => {
    if (risk.lineNumber > 0) {
      const existing = riskLineMap.get(risk.lineNumber) || [];
      existing.push(risk);
      riskLineMap.set(risk.lineNumber, existing);
    }
  });

  // 如果找不到精确行号，尝试通过文本匹配
  if (riskLineMap.size === 0) {
    risks.forEach((risk) => {
      if (risk.originalText && risk.originalText.length > 20) {
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(risk.originalText.substring(0, 40))) {
            const existing = riskLineMap.get(i + 1) || [];
            existing.push(risk);
            riskLineMap.set(i + 1, existing);
            break;
          }
        }
      }
    });
  }

  const getRiskLevelClass = (level: string): string => {
    switch (level) {
      case 'high':
        return 'bg-red-100 border-l-4 border-red-500 hover:bg-red-200';
      case 'medium':
        return 'bg-yellow-100 border-l-4 border-yellow-500 hover:bg-yellow-200';
      case 'low':
        return 'bg-green-100 border-l-4 border-green-500 hover:bg-green-200';
      default:
        return 'bg-blue-50 border-l-4 border-blue-400 hover:bg-blue-100';
    }
  };

  return (
    <div className="card-padded">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Contract Text with Risk Highlights
        </h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-500" /> High
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-yellow-500" /> Medium
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-500" /> Low
          </span>
        </div>
      </div>

      <div className="max-h-[600px] overflow-y-auto scrollbar-thin border border-gray-200 rounded-xl bg-gray-50">
        <div className="font-mono text-sm">
          {lines.map((line, index) => {
            const lineNumber = index + 1;
            const lineRisks = riskLineMap.get(lineNumber) || [];
            const hasRisk = lineRisks.length > 0;

            return (
              <div
                key={lineNumber}
                className={`flex ${hasRisk ? getRiskLevelClass(lineRisks[0].level) : ''} clause-highlight`}
              >
                {/* 行号 */}
                <span className="w-12 flex-shrink-0 text-right pr-3 py-0.5 text-xs text-gray-400 select-none border-r border-gray-200">
                  {lineNumber}
                </span>
                {/* 行内容 */}
                <div className="flex-1 px-3 py-0.5 relative">
                  <span className={`${hasRisk ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                    {line || '\u00A0'}
                  </span>
                  {/* 风险标记 */}
                  {hasRisk && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {lineRisks.map((risk) => (
                        <button
                          key={risk.id}
                          onClick={() =>
                            setSelectedRiskId(selectedRiskId === risk.id ? null : risk.id)
                          }
                          className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer transition-colors ${
                            risk.level === 'high'
                              ? 'bg-red-200 text-red-800 hover:bg-red-300'
                              : risk.level === 'medium'
                              ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300'
                              : 'bg-green-200 text-green-800 hover:bg-green-300'
                          }`}
                        >
                          {risk.level.toUpperCase()}: {risk.title}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* 风险详情展开 */}
                  {hasRisk &&
                    lineRisks
                      .filter((r) => r.id === selectedRiskId)
                      .map((risk) => (
                        <div
                          key={`detail-${risk.id}`}
                          className="mt-2 p-3 bg-white border border-gray-200 rounded-lg text-xs animate-slide-up"
                        >
                          <p className="font-semibold text-gray-900 mb-1">{risk.title}</p>
                          <p className="text-red-600 mb-1">
                            <strong>Problem:</strong> {risk.problem}
                          </p>
                          <p className="text-green-600 mb-1">
                            <strong>Suggestion:</strong> {risk.suggestion}
                          </p>
                          {risk.suggestedRevision && (
                            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs font-semibold text-green-800 mb-1">
                                Suggested Revision:
                              </p>
                              <p className="text-xs text-green-700">{risk.suggestedRevision}</p>
                            </div>
                          )}
                        </div>
                      ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 统计 */}
      <div className="mt-4 flex items-center gap-6 text-xs text-gray-500">
        <span>{lines.length} lines</span>
        <span>{riskLineMap.size} flagged sections</span>
        <span>{risks.length} total findings</span>
      </div>
    </div>
  );
}
