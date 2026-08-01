/**
 * ContractGuard - NextAuth 配置（共享模块）
 * 功能：认证配置，供路由和其他API引用
 */

import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import { createClient } from '@supabase/supabase-js';
import { getUserByEmail, createUser } from '@/lib/db';

// 初始化 Supabase 客户端用于认证
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

export const authOptions: NextAuthOptions = {
  providers: [
    // 邮箱 + 密码登录
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@company.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 使用 Supabase Auth 验证
          const { data, error } = await supabaseAuth.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            console.error('[Auth] Sign in error:', error?.message);
            return null;
          }

          // 确保数据库中有用户记录
          const dbUser = await getUserByEmail(data.user.email || '');
          if (!dbUser) {
            await createUser({
              id: data.user.id,
              email: data.user.email || credentials.email,
              name: data.user.user_metadata?.full_name,
            });
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || null,
            image: data.user.user_metadata?.avatar_url || null,
          };
        } catch (error) {
          console.error('[Auth] Authorize error:', error);
          return null;
        }
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // GitHub OAuth
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    // JWT 回调：存储用户ID和访问令牌
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }

      return token;
    },

    // Session 回调：暴露给前端
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }

      return session;
    },

    // Sign In 回调：OAuth 登录时自动创建用户
    async signIn({ user, account }) {
      if (account?.provider === 'google' || account?.provider === 'github') {
        try {
          const dbUser = await getUserByEmail(user.email || '');
          if (!dbUser) {
            // 为OAuth用户创建 Supabase Auth 账号
            const { data, error } = await supabaseAuth.auth.admin.createUser({
              email: user.email || '',
              email_confirm: true,
              user_metadata: {
                full_name: user.name,
                avatar_url: user.image,
              },
            });

            if (data.user) {
              await createUser({
                id: data.user.id,
                email: user.email || '',
                name: user.name || undefined,
                avatarUrl: user.image || undefined,
              });
            }
          }
        } catch (error) {
          console.error('[Auth] OAuth sign in error:', error);
        }
      }

      return true;
    },
  },

  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },

  secret: process.env.NEXTAUTH_SECRET,
};
