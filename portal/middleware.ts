import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// 認証不要なパス
const publicPaths = [
  '/login',
  '/api/auth',
  '/_next',
  '/favicon.ico',
];

// 公開コンテンツのパス（認証なしでもアクセス可能）
const publicContentPaths = [
  '/articles',
  '/faq',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 認証不要なパスはスキップ
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 公開コンテンツは認証なしでもアクセス可能
  if (publicContentPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // トークンチェック
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 未認証の場合はログインページにリダイレクト
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
