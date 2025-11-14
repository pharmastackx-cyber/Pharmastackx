import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Helper function to verify the JWT
async function verifyToken(token: string) {
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'changeme');
    const { payload } = await jwtVerify(token, secret);
    return payload as { userId: string; role: string };
  } catch (e) {
    console.error('JWT Verification Error:', e);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session_token')?.value;

  const protectedRoutes = ['/admin', '/business', '/delivery-agents', '/orders', '/carechat', '/store-management'];
  const isProtectedRoute = protectedRoutes.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    const payload = await verifyToken(sessionToken || '');

    if (!payload) {
      const loginUrl = new URL('/auth', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('session_token');
      return response;
    }

    // --- Role-based access control ---

    // ***** START OF DEBUGGING LOG *****
    console.log(`[Middleware] Path: ${pathname}, User Role: ${payload.role}`);
    // ***** END OF DEBUGGING LOG *****

    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (pathname.startsWith('/business') || pathname.startsWith('/store-management')) {
      const allowedRoles = ['pharmacy', 'vendor', 'admin'];
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/business/:path*',
    '/delivery-agents/:path*',
    '/orders/:path*',
    '/carechat/:path*',
    '/store-management/:path*',
  ],
};
