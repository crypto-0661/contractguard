/**
 * ContractGuard - Creem Checkout API
 * 功能：创建Creem支付会话，返回支付链接
 * 路由：POST /api/checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CREEM_PRODUCTS } from '@/lib/creem';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { productId, plan } = await request.json();

    // 从 session 获取用户信息
    const session = await getServerSession();
    const userId = session?.user?.id || 'anonymous';
    const email = session?.user?.email || undefined;

    if (!productId || !CREEM_PRODUCTS[productId]) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 });
    }

    const apiKey = process.env.CREEM_API_KEY || '';
    if (!apiKey) {
      return NextResponse.json({ error: 'Creem API key not configured' }, { status: 500 });
    }

    // 调用 Creem REST API 创建 checkout session
    const response = await fetch('https://api.creem.io/v1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        product_id: CREEM_PRODUCTS[productId],
        request_id: userId, // 你的内部用户ID
        customer: email ? { email } : undefined,
        success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clausescan.co'}/app/dashboard?status=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://clausescan.co'}/#pricing?status=canceled`,
        metadata: {
          userId,
          plan,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Creem Checkout] API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 502 }
      );
    }

    const data = await response.json();

    // 返回 checkout URL（url 字段保持前端兼容）
    return NextResponse.json({
      url: data.checkout_url || data.url,
      checkoutUrl: data.checkout_url || data.url,
      checkoutId: data.id,
    });
  } catch (error) {
    console.error('[Creem Checkout] Error:', error);
    return NextResponse.json(
      { error: 'Checkout error' },
      { status: 500 }
    );
  }
}
