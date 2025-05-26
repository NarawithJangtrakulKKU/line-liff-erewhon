// middleware.ts (ในโฟลเดอร์ root ของโปรเจค)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // เส้นทางที่ต้องการ authentication
  const protectedPaths = [
    '/admin',
    '/profile',
    '/cart',
    '/checkout',
    '/orders'
  ];

  // เส้นทางที่เฉพาะ admin เท่านั้น
  const adminPaths = ['/admin'];

  // ตรวจสอบว่าเส้นทางปัจจุบันต้องการ authentication หรือไม่
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  const isAdminPath = adminPaths.some(path => 
    pathname.startsWith(path)
  );

  if (isProtectedPath) {
    // ดึงข้อมูล user จาก JWT
    const user = getUserFromRequest(request);

    // ถ้าไม่มี user หรือ token ไม่ valid
    if (!user) {
      // Redirect ไปหน้า login
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // ถ้าเป็น admin path แต่ user ไม่ใช่ admin
    if (isAdminPath && user.role !== 'ADMIN') {
      // Redirect ไปหน้าหลัก
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // เพิ่ม user data ใน headers เพื่อให้ API routes ใช้ได้
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-role', user.role);
    requestHeaders.set('x-line-user-id', user.lineUserId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
