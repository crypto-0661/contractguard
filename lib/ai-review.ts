/**
 * ContractGuard - AI 合同审阅核心逻辑
 * 功能：调用OpenAI/Claude API分析合同文本，返回结构化审阅结果
 * 支持：风险检测、条款分析、谈判建议、行业合规检查
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type {
  ReviewResult,
  RiskClause,
  RiskCategory,
  Recommendation,
  MissingClause,
  NegotiationTip,
  IndustryCompliance,
  RiskDistribution,
} from '@/types';

// ============================================================
// AI 客户端初始化
// ============================================================

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY || '',
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
      timeout: 50000, // 50s 硬超时，避免撞 Vercel 60s 上限
    });
  }
  return openaiClient;
}

function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });
  }
  return anthropicClient;
}

// ============================================================
// AI 审阅 Prompt 模板
// ============================================================

/**
 * 系统提示词：定义AI的角色和审阅标准
 */
const SYSTEM_PROMPT = `You are an expert contract attorney with 20 years of experience reviewing business contracts. You specialize in helping small business owners understand complex legal documents.

Your task: analyze the given contract text and provide a comprehensive, structured review.

You must analyze the contract across these dimensions:
1. Overall risk assessment (score 1-10, where 1=safest, 10=riskiest)
2. High/medium/low risk clauses with exact locations
3. Missing protective clauses that should be added
4. Negotiation strategies and talking points
5. Industry-specific compliance checks

For each risky clause, provide:
- Category (liability, payment, termination, intellectual_property, confidentiality, non_compete)
- Risk level (high, medium, low)
- A clear, one-line title
- The exact section reference (e.g., "Section 4.2" or "Paragraph 12")
- The approximate line number
- The original text (up to 200 characters)
- A plain-English explanation of the problem
- A practical suggestion for what to ask for
- A suggested revised clause text

Always be specific, actionable, and use plain English. Think about what a small business owner with no legal background needs to know.

IMPORTANT: Return ONLY valid JSON. No markdown fences, no explanations. The JSON must match this exact structure:
{
  "summary": "2-3 sentence plain-English summary of the contract",
  "overallScore": 5.5,
  "risks": [...],
  "recommendations": [...],
  "missingClauses": [...],
  "negotiationTips": [...],
  "industryCompliance": {...},
  "riskDistribution": {...}
}

Keep the output CONCISE to ensure fast response: maximum 5 risk items, 3 recommendations, 3 missing clauses, and 3 negotiation tips. Keep every text field to 1-2 sentences (under 200 characters each). Do not pad the response.`;

/**
 * 用户提示词模板
 */
function buildUserPrompt(contractText: string, industry?: string): string {
  const industryContext = industry
    ? `\n\nThis contract is for the ${industry} industry. Please check industry-specific compliance.`
    : '';

  return `Please review the following contract text and provide a complete analysis.

CONTRACT TEXT:
---
${contractText.length > 50000 ? contractText.substring(0, 50000) + '\n\n[... contract truncated due to length ...]' : contractText}
---${industryContext}

Remember: Return ONLY valid JSON in the structure specified. No markdown or additional text.`;
}

// ============================================================
// 核心审阅函数
// ============================================================

/**
 * 调用AI分析合同文本
 * @param contractText - 提取的合同全文
 * @param industry - 行业类型（可选）
 * @returns 结构化审阅结果
 */
export async function analyzeContract(
  contractText: string,
  industry?: string
): Promise<ReviewResult> {
  const provider = process.env.AI_PROVIDER || 'openai';
  const model = process.env.AI_MODEL || 'gpt-4-turbo-preview';

  console.log(`[AI Review] Starting analysis with ${provider}/${model}`);
  console.log(`[AI Review] Contract text length: ${contractText.length} chars`);

  let rawResponse = '';
  let result: ReviewResult;
  const startedAt = Date.now();

  try {
    if (provider === 'anthropic') {
      rawResponse = await analyzeWithClaude(contractText, model, industry);
    } else {
      rawResponse = await analyzeWithOpenAI(contractText, model, industry);
    }

    result = parseReviewResponse(rawResponse);
  } catch (firstError) {
    const elapsedMs = Date.now() - startedAt;

    // 仅"快速失败"（<30s）时重试；慢响应不重试，避免拖过 Vercel 60s 上限
    if (elapsedMs < 30000) {
      console.error('[AI Review] First attempt failed quickly, retrying in strict mode:', firstError);
      try {
        if (provider === 'anthropic') {
          rawResponse = await analyzeWithClaude(contractText, model, industry, true);
        } else {
          rawResponse = await analyzeWithOpenAI(contractText, model, industry, true);
        }
        result = parseReviewResponse(rawResponse);
      } catch (retryError) {
        console.error('[AI Review] Retry also failed:', retryError);
        console.error('[AI Review] Raw response:', rawResponse.substring(0, 1000));
        throw new Error('AI review failed after retry. Please try again.');
      }
    } else {
      console.error('[AI Review] Attempt too slow, not retrying:', firstError);
      console.error('[AI Review] Raw response (first 1000 chars):', rawResponse.substring(0, 1000));
      throw firstError instanceof Error ? firstError : new Error('AI review failed (too slow)');
    }
  }

  // 验证结果完整性
  validateReviewResult(result);

  console.log(`[AI Review] Analysis complete. Score: ${result.overallScore}`);
  return result;
}

/**
 * 使用 OpenAI 进行分析
 */
async function analyzeWithOpenAI(
  contractText: string,
  model: string,
  industry?: string,
  strict = false
): Promise<string> {
  const openai = getOpenAIClient();

  const strictNote = strict
    ? '\n\nCRITICAL: Your previous output failed to parse as valid JSON. Respond with ONLY a single valid JSON object. No markdown fences, no code blocks, no explanations, no trailing commas.'
    : '';

  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildUserPrompt(contractText, industry) + strictNote },
    ],
    temperature: 0.3, // 低温度以保证一致性
    max_tokens: 4096, // 关闭思考后输出即答案，4096 足够
    // DeepSeek V4 扩展参数：关闭思考模式（默认开启会占满 token 且极慢）
    thinking: { type: 'disabled' },
  } as any);

  const content = response.choices[0]?.message?.content;
  if (!content) {
    // 打印完整响应结构，定位 content 为空的原因
    console.error('[AI Review] OpenAI returned empty content. Full response:', JSON.stringify(response).substring(0, 3000));
    console.error('[AI Review] Finish reason:', response.choices[0]?.finish_reason);
    throw new Error('OpenAI returned empty response');
  }

  return content;
}

/**
 * 使用 Claude 进行分析
 */
async function analyzeWithClaude(
  contractText: string,
  model: string,
  industry?: string,
  strict = false
): Promise<string> {
  const anthropic = getAnthropicClient();

  const strictNote = strict
    ? '\n\nCRITICAL: Your previous output failed to parse as valid JSON. Respond with ONLY a single valid JSON object. No markdown fences, no code blocks, no explanations, no trailing commas.'
    : '';

  const response = await anthropic.messages.create({
    model,
    max_tokens: 4096,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(contractText, industry) + strictNote,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned empty or non-text response');
  }

  return textBlock.text;
}

// ============================================================
// 响应解析和验证
// ============================================================

/**
 * 解析AI返回的JSON响应
 */
function parseReviewResponse(rawJson: string): ReviewResult {
  try {
    // 清理 markdown 代码块标记（```json / ```）
    let cleaned = rawJson.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();

    // 提取第一个 { 到最后一个 } 之间的内容（剥离任何前后多余文本）
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    // 解析（首次失败时尝试移除尾逗号再解析）
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = JSON.parse(cleaned.replace(/,\s*([}\]])/g, '$1'));
    }

    return {
      contractId: '',
      summary: String(parsed.summary || 'No summary available.'),
      overallScore: Number(parsed.overallScore) || 5,
      risks: ensureArray<Record<string, unknown>>(parsed.risks).map(normalizeRisk),
      recommendations: ensureArray<Record<string, unknown>>(parsed.recommendations).map(normalizeRecommendation),
      missingClauses: ensureArray<Record<string, unknown>>(parsed.missingClauses).map(normalizeMissingClause),
      negotiationTips: ensureArray<Record<string, unknown>>(parsed.negotiationTips).map(normalizeNegotiationTip),
      industryCompliance: normalizeIndustryCompliance(parsed.industryCompliance),
      riskDistribution: normalizeRiskDistribution(parsed.riskDistribution),
    };
  } catch (error) {
    console.error('[AI Review] Failed to parse AI response:', error);
    console.error('[AI Review] Raw response:', rawJson.substring(0, 1000));
    throw new Error('Failed to parse AI review response');
  }
}

/**
 * 验证审阅结果
 */
function validateReviewResult(result: ReviewResult): void {
  if (result.overallScore < 1 || result.overallScore > 10) {
    result.overallScore = Math.max(1, Math.min(10, result.overallScore));
  }
  if (!result.summary || result.summary.length < 10) {
    result.summary = 'Contract review completed. See detailed analysis below.';
  }
}

// ============================================================
// 数据规范化函数
// ============================================================

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeRisk(risk: Record<string, unknown>, index: number): RiskClause {
  const validCategories: RiskCategory[] = [
    'liability', 'payment', 'termination',
    'intellectual_property', 'confidentiality', 'non_compete',
  ];
  const validLevels: RiskClause['level'][] = ['high', 'medium', 'low', 'info'];

  return {
    id: `risk-${index}-${Date.now()}`,
    category: validCategories.includes(risk.category as RiskCategory)
      ? (risk.category as RiskCategory)
      : 'liability',
    level: validLevels.includes(risk.level as RiskClause['level'])
      ? (risk.level as RiskClause['level'])
      : 'medium',
    title: String(risk.title || 'Unnamed Risk'),
    section: String(risk.section || 'Unknown section'),
    lineNumber: Number(risk.lineNumber) || 0,
    originalText: String(risk.originalText || ''),
    problem: String(risk.problem || ''),
    suggestion: String(risk.suggestion || ''),
    suggestedRevision: String(risk.suggestedRevision || ''),
  };
}

function normalizeRecommendation(rec: Record<string, unknown>, index: number): Recommendation {
  return {
    id: `rec-${index}-${Date.now()}`,
    clauseRef: String(rec.clauseRef || ''),
    priority: (['high', 'medium', 'low', 'info'] as const).includes(rec.priority as never)
      ? (rec.priority as Recommendation['priority'])
      : 'medium',
    action: String(rec.action || ''),
    detail: String(rec.detail || ''),
  };
}

function normalizeMissingClause(clause: Record<string, unknown>, index: number): MissingClause {
  return {
    id: `missing-${index}-${Date.now()}`,
    clauseName: String(clause.clauseName || 'Unnamed clause'),
    importance: (['high', 'medium', 'low', 'info'] as const).includes(clause.importance as never)
      ? (clause.importance as MissingClause['importance'])
      : 'medium',
    description: String(clause.description || ''),
    recommendedLanguage: String(clause.recommendedLanguage || ''),
  };
}

function normalizeNegotiationTip(tip: Record<string, unknown>, index: number): NegotiationTip {
  return {
    id: `tip-${index}-${Date.now()}`,
    category: String(tip.category || 'general'),
    strategy: String(tip.strategy || ''),
    talkingPoints: Array.isArray(tip.talkingPoints)
      ? tip.talkingPoints.map(String)
      : [],
    fallbackPosition: String(tip.fallbackPosition || ''),
  };
}

function normalizeIndustryCompliance(data: unknown): IndustryCompliance {
  if (typeof data !== 'object' || data === null) {
    return {
      industry: 'general',
      standards: [],
      compliant: true,
      issues: [],
      recommendations: [],
    };
  }
  const d = data as Record<string, unknown>;
  return {
    industry: String(d.industry || 'general'),
    standards: Array.isArray(d.standards) ? d.standards.map(String) : [],
    compliant: Boolean(d.compliant ?? true),
    issues: Array.isArray(d.issues) ? d.issues.map(String) : [],
    recommendations: Array.isArray(d.recommendations) ? d.recommendations.map(String) : [],
  };
}

function normalizeRiskDistribution(data: unknown): RiskDistribution {
  const defaults: RiskDistribution = {
    liability: 0,
    payment: 0,
    termination: 0,
    intellectual_property: 0,
    confidentiality: 0,
    non_compete: 0,
  };
  if (typeof data !== 'object' || data === null) {
    return defaults;
  }
  const d = data as Record<string, unknown>;
  return {
    liability: Number(d.liability) || 0,
    payment: Number(d.payment) || 0,
    termination: Number(d.termination) || 0,
    intellectual_property: Number(d.intellectual_property) || 0,
    confidentiality: Number(d.confidentiality) || 0,
    non_compete: Number(d.non_compete) || 0,
  };
}

// ============================================================
// 辅助函数
// ============================================================

/**
 * 估算合同风险评估的token消耗
 */
export function estimateTokens(text: string): number {
  // 粗略估算：1 token ≈ 4字符（英文）
  return Math.ceil(text.length / 4);
}

/**
 * 检查合同文本是否过长
 */
export function isContractTooLong(text: string, maxTokens: number = 80000): boolean {
  return estimateTokens(text) > maxTokens;
}
