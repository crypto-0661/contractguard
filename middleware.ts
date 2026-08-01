/**
 * ContractGuard - 认证中间件
 * 功能：保护 /dashboard、/upload、/review 等页面，未登录跳转登录页
 */

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

// 需要登录才能访问的路由
export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/review/:path*'],
};
