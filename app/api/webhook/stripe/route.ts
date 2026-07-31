/**
 * ContractGuard - Stripe Webhook API
 * 功能：处理Stripe支付事件、同步订阅状态、更新用户计划
 * 路由：POST /api/webhook/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import { upsertSubscription, updateUserPlan } from '@/lib/db';

// 禁用body解析，Stripe需要原始body进行签名验证
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    // 验证webhook签名
    let event;
    try {
      event = await verifyWebhookSignature(body, signature);
    } catch (err) {
      console.error('[Stripe Webhook] Signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log(`[Stripe Webhook] Event received: ${event.type}`);

    // 处理不同事件类型
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutCompleted(event.data.object as Record<string, unknown>);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Record<string, unknown>);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Record<string, unknown>);
        break;
      }

      case 'invoice.payment_succeeded': {
        await handleInvoicePaymentSucceeded(event.data.object as Record<string, unknown>);
        break;
      }

      case 'invoice.payment_failed': {
        await handleInvoicePaymentFailed(event.data.object as Record<string, unknown>);
        break;
      }

      default: {
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Stripe Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook handler error' },
      { status: 500 }
    );
  }
}

/**
 * 处理 Checkout 完成
 */
async function handleCheckoutCompleted(session: Record<string, unknown>) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const metadata = session.metadata as Record<string, string> | undefined;

  if (!customerId || !metadata?.userId) {
    console.warn('[Stripe Webhook] Missing customerId or userId in checkout session');
    return;
  }

  console.log(`[Stripe Webhook] Checkout completed for user: ${metadata.userId}, plan: ${metadata.plan}`);

  // 临时更新用户计划（正式订阅通过 subscription.updated 事件同步）
  await updateUserPlan(metadata.userId, metadata.plan || 'starter');
}

/**
 * 处理订阅更新
 */
async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  const subscriptionId = subscription.id as string;
  const customerId = subscription.customer as string;
  const status = subscription.status as string;
  const items = subscription.items as { data: Array<{ price: { id: string } }> } | undefined;
  const priceId = items?.data?.[0]?.price?.id || '';
  const metadata = subscription.metadata as Record<string, string> | undefined;
  const currentPeriodStart = subscription.current_period_start as number;
  const currentPeriodEnd = subscription.current_period_end as number;
  const cancelAtPeriodEnd = (subscription.cancel_at_period_end as boolean) || false;

  if (!metadata?.userId) {
    console.warn('[Stripe Webhook] Missing userId in subscription metadata');
    return;
  }

  // 映射价格ID到计划
  const planMapping: Record<string, string> = {
    [process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || '']: 'starter',
    [process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '']: 'pro',
    [process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID || '']: 'business',
  };
  const plan = planMapping[priceId] || metadata.plan || 'starter';

  console.log(`[Stripe Webhook] Subscription ${status} for user: ${metadata.userId}, plan: ${plan}`);

  // Upsert 订阅记录
  await upsertSubscription({
    userId: metadata.userId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    plan,
    status,
    currentPeriodStart: new Date(currentPeriodStart * 1000),
    currentPeriodEnd: new Date(currentPeriodEnd * 1000),
    cancelAtPeriodEnd,
  });

  // 更新用户计划
  if (status === 'active' || status === 'trialing') {
    await updateUserPlan(metadata.userId, plan);
  } else if (status === 'past_due' || status === 'canceled') {
    await updateUserPlan(metadata.userId, 'free');
  }
}

/**
 * 处理订阅删除
 */
async function handleSubscriptionDeleted(subscription: Record<string, unknown>) {
  const metadata = subscription.metadata as Record<string, string> | undefined;

  if (!metadata?.userId) {
    console.warn('[Stripe Webhook] Missing userId in subscription metadata');
    return;
  }

  console.log(`[Stripe Webhook] Subscription deleted for user: ${metadata.userId}`);

  await updateUserPlan(metadata.userId, 'free');
}

/**
 * 处理发票支付成功
 */
async function handleInvoicePaymentSucceeded(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string;
  console.log(`[Stripe Webhook] Invoice paid for customer: ${customerId}`);
  // 记录支付成功日志（可选）
}

/**
 * 处理发票支付失败
 */
async function handleInvoicePaymentFailed(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string;
  console.warn(`[Stripe Webhook] Invoice payment failed for customer: ${customerId}`);
  // 可在此发送邮件通知用户
}
