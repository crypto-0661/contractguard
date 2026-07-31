/**
 * ContractGuard - Stripe 客户端配置
 * 功能：Stripe SDK初始化、支付会话创建、订阅管理
 */

import Stripe from 'stripe';

// 初始化 Stripe 服务端客户端
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Stripe Price IDs 映射
export const STRIPE_PRICES: Record<string, string> = {
  starter: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || 'price_starter',
  pro: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
  business: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || 'price_business',
};

// 计划特性映射（用于 Stripe metadata 和本地验证）
export const PLAN_LIMITS: Record<string, { contractsPerMonth: number; features: string[] }> = {
  starter: {
    contractsPerMonth: 5,
    features: ['risk_scoring', 'clause_analysis', 'email_support', 'pdf_docx_support'],
  },
  pro: {
    contractsPerMonth: 20,
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
 * 创建 Stripe Checkout 会话
 * @param customerId - Stripe 客户 ID
 * @param priceId - Stripe Price ID
 * @param userId - 应用用户 ID
 * @param plan - 订阅计划类型
 * @returns Checkout 会话 URL
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  plan: string
): Promise<string> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    billing_address_collection: 'auto',
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
      trial_period_days: 7,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&status=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?status=canceled`,
    metadata: {
      userId,
      plan,
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  return session.url;
}

/**
 * 创建 Stripe Customer Portal 会话
 * @param customerId - Stripe 客户 ID
 * @returns Portal 会话 URL
 */
export async function createPortalSession(customerId: string): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });

  return session.url;
}

/**
 * 创建或获取 Stripe 客户
 * @param email - 用户邮箱
 * @param name - 用户名
 * @returns Stripe 客户 ID
 */
export async function getOrCreateCustomer(
  email: string,
  name?: string | null
): Promise<string> {
  // 搜索已有客户
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // 创建新客户
  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      source: 'contractguard',
    },
  });

  return customer.id;
}

/**
 * 验证 Stripe Webhook 签名
 * @param body - 原始请求体
 * @param signature - Stripe 签名头
 * @returns 验证后的事件
 */
export async function verifyWebhookSignature(
  body: string,
  signature: string
): Promise<Stripe.Event> {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    throw new Error('Invalid webhook signature');
  }
}
