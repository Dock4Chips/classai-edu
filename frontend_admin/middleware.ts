import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const token = request.cookies.get('AUTH_TOKEN');
  const { pathname } = request.nextUrl;

  // 设置默认语言 Cookie
  if (!request.cookies.get('lang')) {
    response.cookies.set('lang', 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  // 需要登录的页面列表（/admin 下的所有页面）
  const protectedPaths = [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
    '/admin/roles',
    '/admin/banners',
    '/admin/devices',
    '/admin/models',
    '/admin/profile',
    '/admin/change-password',
    '/admin/settings',
  ];

  // 公开页面
  const publicPaths = [
    '/identity',
    '/',
    '/welcome',
    '/test_ws',
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

  // 如果已登录用户访问登录页，跳转到 admin dashboard
  if (token && pathname === '/identity') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // 如果设置了语言 Cookie，需要返回 response
  if (response.cookies.get('lang')) {
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};