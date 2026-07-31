/**
 * ContractGuard - Creem Webhook API
 * 功能：处理Creem支付事件、同步订阅状态、更新用户计划
 * 路由：POST /api/webhook/creem
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCreemSignature, getPlanByProductId } from '@/lib/creem';
import { upsertSubscription, updateUserPlan } from '@/lib/db';

// 禁用body解析，需要原始body进行签名验证
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('creem-signature') || '';

    // 验证签名
    const secret = process.env.CREEM_WEBHOOK_SECRET || '';
    if (!verifyCreemSignature(rawBody, signature, secret)) {
      console.error('[Creem Webhook] Signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 解析事件
    const event = JSON.parse(rawBody);
    const eventType = event.eventType;
    const obj = event.object || {};

    console.log(`[Creem Webhook] Event received: ${eventType}`);

    switch (eventType) {
      case 'checkout.completed': {
        await handleCheckoutCompleted(obj);
        break;
      }

      case 'subscription.active':
      case 'subscription.paid': {
        await handleSubscriptionActive(obj);
        break;
      }

      case 'subscription.canceled':
      case 'subscription.expired': {
        await handleSubscriptionCanceled(obj);
        break;
      }

      case 'subscription.past_due': {
        await handleSubscriptionPastDue(obj);
        break;
      }

      default: {
        console.log(`[Creem Webhook] Unhandled event type: ${eventType}`);
      }
    }

    // 快速返回200，Creem会重试非200响应
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Creem Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }
}

/**
 * 处理 Checkout 完成 — 授予访问权限
 * object: { id, order: {...}, product: {...}, customer: {...}, subscription: {...}, metadata: {...} }
 */
async function handleCheckoutCompleted(obj: Record<string, any>) {
  const metadata = obj.metadata || {};
  const userId = metadata.userId;
  const plan = metadata.plan || getPlanByProductId(obj.product?.id || '');

  if (!userId) {
    console.warn('[Creem Webhook] Missing userId in checkout metadata');
    return;
  }

  console.log(`[Creem Webhook] Checkout completed for user: ${userId}, plan: ${plan}`);
  await updateUserPlan(userId, plan);
}

/**
 * 处理订阅激活/付款成功
 * object: { id, status, product: {...}, customer: {...}, current_period_end_date, metadata: {...} }
 */
async function handleSubscriptionActive(obj: Record<string, any>) {
  const subscriptionId = obj.id || '';
  const customerId = obj.customer || '';
  const status = obj.status || 'active';
  const productId = obj.product || '';
  const plan = getPlanByProductId(productId);
  const metadata = obj.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.warn('[Creem Webhook] Missing userId in subscription metadata');
    return;
  }

  const currentPeriodStart = obj.current_period_start_date
    ? new Date(obj.current_period_start_date)
    : new Date();
  const currentPeriodEnd = obj.current_period_end_date
    ? new Date(obj.current_period_end_date)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const cancelAtPeriodEnd = Boolean(obj.cancel_at_period_end) || false;

  console.log(`[Creem Webhook] Subscription ${status} for user: ${userId}, plan: ${plan}`);

  await upsertSubscription({
    userId,
    stripeSubscriptionId: subscriptionId || `sub_${Date.now()}`,
    stripePriceId: productId || '',
    plan,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  });

  if (status === 'active' || status === 'trialing') {
    await updateUserPlan(userId, plan);
  }
}

/**
 * 处理订阅取消/过期
 */
async function handleSubscriptionCanceled(obj: Record<string, any>) {
  const metadata = obj.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.warn('[Creem Webhook] Missing userId in canceled subscription metadata');
    return;
  }

  console.log(`[Creem Webhook] Subscription canceled for user: ${userId}`);
  await updateUserPlan(userId, 'free');
}

/**
 * 处理订阅逾期
 */
async function handleSubscriptionPastDue(obj: Record<string, any>) {
  const metadata = obj.metadata || {};
  const userId = metadata.userId;

  if (!userId) {
    console.warn('[Creem Webhook] Missing userId in past_due subscription metadata');
    return;
  }

  console.log(`[Creem Webhook] Subscription past due for user: ${userId}`);
  await updateUserPlan(userId, 'free');
}
