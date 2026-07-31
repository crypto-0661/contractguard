/**
 * ContractGuard - Creem 支付配置
 * 功能：Creem API密钥、产品映射、计划限制
 */

// Creem 产品 ID 映射（从 Creem Dashboard → Products → Copy ID 获取）
export const CREEM_PRODUCTS: Record<string, string> = {
  starter: process.env.CREEM_STARTER_PRODUCT_ID || '',
  pro: process.env.CREEM_PRO_PRODUCT_ID || '',
  business: process.env.CREEM_BUSINESS_PRODUCT_ID || '',
};

// 计划特性映射（用于本地验证和权限控制）
export const PLAN_LIMITS: Record<string, { contractsPerMonth: number; features: string[] }> = {
  starter: {
    contractsPerMonth: 10,
    features: ['risk_scoring', 'clause_analysis', 'email_support', 'pdf_docx_support'],
  },
  pro: {
    contractsPerMonth: 50,
    features: [
      'risk_scoring',
      'clause_analysis',
      'suggested_revisions',
      'negotiation_playbook',
      'priority_support',
      'pdf_docx_support',
      'industry_compliance',
    ],
  },
  business: {
    contractsPerMonth: 999999, // 无限
    features: [
      'risk_scoring',
      'clause_analysis',
      'suggested_revisions',
      'negotiation_playbook',
      'priority_support',
      'pdf_docx_support',
      'industry_compliance',
      'team_collaboration',
      'custom_templates',
      'dedicated_account_manager',
      'api_access',
    ],
  },
  free: {
    contractsPerMonth: 1,
    features: ['risk_scoring', 'basic_analysis', 'pdf_docx_support'],
  },
};

/**
 * 通过 productId 反查计划名
 */
export function getPlanByProductId(productId: string): string {
  const entries = Object.entries(CREEM_PRODUCTS);
  for (const [plan, id] of entries) {
    if (id === productId) return plan;
  }
  return 'starter';
}

/**
 * 验证 Creem Webhook 签名（HMAC-SHA256）
 */
import crypto from 'crypto';

export function verifyCreemSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  if (!signature || !secret) return false;
  try {
    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (err) {
    console.error('[Creem] Signature verification error:', err);
    return false;
  }
}
