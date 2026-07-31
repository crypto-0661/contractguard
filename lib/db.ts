/**
 * ContractGuard - Supabase 客户端配置
 * 功能：初始化Supabase客户端、数据库辅助函数
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

// ============================================================
// Supabase 客户端初始化
// ============================================================

/** 服务端 Supabase 客户端（使用 service_role key，绕过 RLS） */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * 创建用户上下文相关的 Supabase 客户端（带 RLS）
 * 用于 API 路由中需要根据用户身份访问数据
 */
export function createServerSupabaseClient(accessToken: string) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

// ============================================================
// 用户相关数据库操作
// ============================================================

/**
 * 通过邮箱查找用户
 */
export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from('User')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[DB] getUserByEmail error:', error);
    return null;
  }

  return data;
}

/**
 * 创建新用户
 */
export async function createUser(user: {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('User')
    .insert({
      id: user.id,
      email: user.email,
      name: user.name || null,
      avatar_url: user.avatarUrl || null,
      plan: 'free',
    })
    .select()
    .single();

  if (error) {
    console.error('[DB] createUser error:', error);
    throw new Error(`Failed to create user: ${error.message}`);
  }

  return data;
}

/**
 * 更新用户计划
 */
export async function updateUserPlan(userId: string, plan: string) {
  const { error } = await supabaseAdmin
    .from('User')
    .update({ plan, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) {
    console.error('[DB] updateUserPlan error:', error);
    throw new Error(`Failed to update user plan: ${error.message}`);
  }
}

// ============================================================
// 合同相关数据库操作
// ============================================================

/**
 * 创建合同记录
 */
export async function createContract(contract: {
  userId: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
  pageCount?: number;
}) {
  const { data, error } = await supabaseAdmin
    .from('Contract')
    .insert({
      user_id: contract.userId,
      file_name: contract.fileName,
      file_url: contract.fileUrl,
      file_size: contract.fileSize || null,
      file_type: contract.fileType || null,
      page_count: contract.pageCount || 0,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('[DB] createContract error:', error);
    throw new Error(`Failed to create contract: ${error.message}`);
  }

  return data;
}

/**
 * 获取用户的所有合同
 */
export async function getUserContracts(userId: string, limit = 20) {
  const { data, error } = await supabaseAdmin
    .from('Contract')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[DB] getUserContracts error:', error);
    return [];
  }

  return data || [];
}

/**
 * 获取单个合同
 */
export async function getContractById(contractId: string) {
  const { data, error } = await supabaseAdmin
    .from('Contract')
    .select('*')
    .eq('id', contractId)
    .single();

  if (error) {
    console.error('[DB] getContractById error:', error);
    return null;
  }

  return data;
}

/**
 * 更新合同状态和评分
 */
export async function updateContractStatus(
  contractId: string,
  status: string,
  riskScore?: number
) {
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (riskScore !== undefined) {
    updateData.risk_score = riskScore;
  }

  const { error } = await supabaseAdmin
    .from('Contract')
    .update(updateData)
    .eq('id', contractId);

  if (error) {
    console.error('[DB] updateContractStatus error:', error);
    throw new Error(`Failed to update contract status: ${error.message}`);
  }
}

// ============================================================
// 审阅相关数据库操作
// ============================================================

/**
 * 创建审阅结果
 */
export async function createReview(review: {
  contractId: string;
  summary: string;
  overallScore: number;
  risks: unknown[];
  recommendations: unknown[];
  missingClauses: unknown[];
  negotiationTips: unknown[];
  industryCompliance: Record<string, unknown>;
  riskDistribution: Record<string, number>;
  rawAiResponse?: string;
}) {
  const { data, error } = await supabaseAdmin
    .from('Review')
    .insert({
      contract_id: review.contractId,
      summary: review.summary,
      overall_score: review.overallScore,
      risks: review.risks,
      recommendations: review.recommendations,
      missing_clauses: review.missingClauses,
      negotiation_tips: review.negotiationTips,
      industry_compliance: review.industryCompliance,
      risk_distribution: review.riskDistribution,
      raw_ai_response: review.rawAiResponse || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[DB] createReview error:', error);
    throw new Error(`Failed to create review: ${error.message}`);
  }

  return data;
}

/**
 * 获取合同的审阅结果
 */
export async function getReviewByContractId(contractId: string) {
  const { data, error } = await supabaseAdmin
    .from('Review')
    .select('*')
    .eq('contract_id', contractId)
    .single();

  if (error) {
    console.error('[DB] getReviewByContractId error:', error);
    return null;
  }

  return data;
}

// ============================================================
// 订阅相关数据库操作
// ============================================================

/**
 * 创建或更新订阅记录
 */
export async function upsertSubscription(subscription: {
  userId: string;
  stripeSubscriptionId: string;
  stripePriceId: string;
  plan: string;
  status: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}) {
  const { data, error } = await supabaseAdmin
    .from('Subscription')
    .upsert(
      {
        user_id: subscription.userId,
        stripe_subscription_id: subscription.stripeSubscriptionId,
        stripe_price_id: subscription.stripePriceId,
        plan: subscription.plan,
        status: subscription.status,
        current_period_start: subscription.currentPeriodStart?.toISOString() || null,
        current_period_end: subscription.currentPeriodEnd?.toISOString() || null,
        cancel_at_period_end: subscription.cancelAtPeriodEnd || false,
      },
      {
        onConflict: 'stripe_subscription_id',
      }
    )
    .select()
    .single();

  if (error) {
    console.error('[DB] upsertSubscription error:', error);
    throw new Error(`Failed to upsert subscription: ${error.message}`);
  }

  return data;
}

/**
 * 获取用户的活跃订阅
 */
export async function getActiveSubscription(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('Subscription')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('[DB] getActiveSubscription error:', error);
    return null;
  }

  return data;
}

// ============================================================
// 用户统计
// ============================================================

/**
 * 获取用户合约统计
 */
export async function getUserStats(userId: string) {
  const { data, error } = await supabaseAdmin.rpc('get_user_stats', {
    uid: userId,
  });

  if (error) {
    console.error('[DB] getUserStats error:', error);
    return {
      total_contracts: 0,
      contracts_this_month: 0,
      avg_risk_score: 0,
      high_risk_count: 0,
    };
  }

  return data?.[0] || {
    total_contracts: 0,
    contracts_this_month: 0,
    avg_risk_score: 0,
    high_risk_count: 0,
  };
}

/**
 * 检查用户合约限制
 */
export async function checkContractLimit(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc('check_contract_limit', {
    uid: userId,
  });

  if (error) {
    console.error('[DB] checkContractLimit error:', error);
    return true; // 出错时放行
  }

  return Boolean(data);
}
