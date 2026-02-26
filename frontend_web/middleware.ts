import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('AUTH_TOKEN');
  const { pathname } = request.nextUrl;

  // 需要登录的页面列表
  const protectedPaths = [
    '/dashboard',
    '/detection',
    '/projects',
    '/reports',
    '/profile',
    '/change-password',
  ];

  // 公开页面（不需要登录即可访问）
  const publicPaths = [
    '/',
    '/identity',
  ];

  // 检查是否是受保护的路径
  const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  // 检查是否是公开路径
  const isPublicPath = publicPaths.some(path => pathname === path) || pathname.startsWith('/auth/');

  // 如果访问受保护页面但没有 token，重定向到登录页
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/identity', request.url);
    // 保存原始路径，登录后可以跳转回去
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 如果已登录用户访问登录页，跳转到 dashboard（首页可以正常访问）
  if (token && pathname === '/identity') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径，除了：
     * - api 路由 (/api/*)
     * - _next/static 文件
     * - _next/image 文件
     * - favicon.ico
     * - 公共静态文件
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};