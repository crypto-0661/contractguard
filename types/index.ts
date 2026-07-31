/**
 * ContractGuard - TypeScript 类型定义
 * 功能：所有核心数据结构和API类型
 */

// ============================================================
// 数据库模型类型
// ============================================================

/** 用户订阅计划 */
export type PlanType = 'starter' | 'pro' | 'business' | 'free';

/** 合同处理状态 */
export type ContractStatus = 'pending' | 'processing' | 'completed' | 'failed';

/** 订阅状态 */
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

/** 风险等级 */
export type RiskLevel = 'high' | 'medium' | 'low' | 'info';

// ============================================================
// 风险类别
// ============================================================

export const RISK_CATEGORIES = [
  'liability',
  'payment',
  'termination',
  'intellectual_property',
  'confidentiality',
  'non_compete',
] as const;

export type RiskCategory = typeof RISK_CATEGORIES[number];

export const RISK_CATEGORY_LABELS: Record<RiskCategory, string> = {
  liability: 'Liability & Indemnification',
  payment: 'Payment Terms',
  termination: 'Termination Clauses',
  intellectual_property: 'Intellectual Property',
  confidentiality: 'Confidentiality & NDA',
  non_compete: 'Non-Compete & Restrictive Covenants',
};

// ============================================================
// 合同相关类型
// ============================================================

/** 合同记录 */
export interface Contract {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  pageCount: number;
  status: ContractStatus;
  riskScore: number | null;
  createdAt: string;
  updatedAt: string;
}

/** 单个风险条款 */
export interface RiskClause {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  title: string;
  section: string;
  lineNumber: number;
  originalText: string;
  problem: string;
  suggestion: string;
  suggestedRevision: string;
}

/** 修改建议 */
export interface Recommendation {
  id: string;
  clauseRef: string;
  priority: RiskLevel;
  action: string;
  detail: string;
}

/** 缺失条款 */
export interface MissingClause {
  id: string;
  clauseName: string;
  importance: RiskLevel;
  description: string;
  recommendedLanguage: string;
}

/** 谈判建议 */
export interface NegotiationTip {
  id: string;
  category: string;
  strategy: string;
  talkingPoints: string[];
  fallbackPosition: string;
}

/** 行业合规检查 */
export interface IndustryCompliance {
  [key: string]: unknown;
  industry: string;
  standards: string[];
  compliant: boolean;
  issues: string[];
  recommendations: string[];
}

/** 风险分布 */
export interface RiskDistribution {
  [key: string]: unknown;
  liability: number;
  payment: number;
  termination: number;
  intellectual_property: number;
  confidentiality: number;
  non_compete: number;
}

// ============================================================
// 审阅结果类型
// ============================================================

/** AI审阅完整结果 */
export interface ReviewResult {
  contractId: string;
  summary: string;
  overallScore: number;
  risks: RiskClause[];
  recommendations: Recommendation[];
  missingClauses: MissingClause[];
  negotiationTips: NegotiationTip[];
  industryCompliance: IndustryCompliance;
  riskDistribution: RiskDistribution;
}

/** 审阅数据库记录 */
export interface Review {
  id: string;
  contractId: string;
  summary: string;
  overallScore: number;
  risks: RiskClause[];
  recommendations: Recommendation[];
  missingClauses: MissingClause[];
  negotiationTips: NegotiationTip[];
  industryCompliance: IndustryCompliance;
  riskDistribution: RiskDistribution;
  rawAiResponse: string | null;
  createdAt: string;
}

// ============================================================
// 用户相关类型
// ============================================================

/** 用户 */
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  stripeCustomerId: string | null;
  plan: PlanType;
  createdAt: string;
}

/** 订阅 */
export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: PlanType;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

// ============================================================
// API 请求/响应类型
// ============================================================

/** 上传合同响应 */
export interface UploadResponse {
  success: boolean;
  contractId: string;
  fileUrl: string;
  message: string;
}

/** AI审阅请求 */
export interface ReviewRequest {
  contractId: string;
  contractText: string;
  industry?: string;
}

/** AI审阅响应 */
export interface ReviewResponse {
  success: boolean;
  review: ReviewResult;
  processingTimeMs: number;
}

/** Stripe Checkout 请求 */
export interface CheckoutRequest {
  plan: PlanType;
}

/** Stripe Checkout 响应 */
export interface CheckoutResponse {
  url: string;
  sessionId: string;
}

/** Stripe Portal 请求 */
export interface PortalRequest {
  customerId: string;
}

/** Stripe Portal 响应 */
export interface PortalResponse {
  url: string;
}

/** API 错误响应 */
export interface ApiError {
  error: string;
  code: string;
  details?: string;
}

// ============================================================
// UI 组件 Props
// ============================================================

/** 导航栏 */
export interface NavbarProps {
  user?: User | null;
}

/** 合同上传组件 */
export interface ContractUploaderProps {
  onUploadComplete: (contractId: string) => void;
  maxFileSize?: number; // MB
  allowedTypes?: string[];
}

/** 风险仪表盘 */
export interface RiskDashboardProps {
  review: ReviewResult;
  contractName: string;
}

/** 条款高亮 */
export interface ClauseHighlighterProps {
  risks: RiskClause[];
  contractText: string;
}

/** 摘要卡片 */
export interface SummaryCardProps {
  summary: string;
  overallScore: number;
  riskDistribution: RiskDistribution;
}

/** 定价组件 */
export interface PricingTableProps {
  currentPlan?: PlanType;
  onSelectPlan?: (plan: PlanType) => void;
}

// ============================================================
// 上传状态
// ============================================================

export interface UploadState {
  file: File | null;
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error';
  errorMessage?: string;
  contractId?: string;
}
