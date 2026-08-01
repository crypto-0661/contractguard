/**
 * ContractGuard - NextAuth.js 认证路由
 * 功能：处理用户登录/注册
 * 路由：/api/auth/[...nextauth]
 */

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
