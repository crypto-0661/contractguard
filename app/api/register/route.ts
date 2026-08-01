/**
 * ContractGuard - 注册 API
 * 功能：创建 Supabase 用户账号
 * 路由：POST /api/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createUser } from '@/lib/db';

const supabaseAuth = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    // 创建 Supabase Auth 用户
    const { data, error } = await supabaseAuth.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 自动确认邮箱，跳过邮件验证
      user_metadata: {
        full_name: name || email.split('@')[0],
      },
    });

    if (error) {
      console.error('[Register] Create user error:', error.message);
      return NextResponse.json(
        { error: error.message === 'User already registered' ? 'This email is already registered' : error.message },
        { status: 400 }
      );
    }

    // 在业务库中创建用户记录
    if (data.user) {
      try {
        await createUser({
          id: data.user.id,
          email: data.user.email || email,
          name: name || undefined,
        });
      } catch (dbError: any) {
        // 业务表插入失败 → 回滚已创建的 Auth 用户，避免半注册状态
        console.error('[Register] DB user creation failed, rolling back auth user:', dbError?.message);
        try {
          await supabaseAuth.auth.admin.deleteUser(data.user.id);
        } catch (rollbackError) {
          console.error('[Register] Rollback failed:', rollbackError);
        }
        throw dbError;
      }
    }

    return NextResponse.json({ success: true, userId: data.user?.id });
  } catch (error: any) {
    // 返回真实错误信息，方便前端直接显示定位
    console.error('[Register] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
