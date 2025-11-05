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

  // Define routes that require authentication
  const protectedRoutes = ['/admin', '/business', '/delivery-agents', '/orders', '/carechat'];

  // Check if the path is a protected route
  const isProtectedRoute = protectedRoutes.some(path => pathname.startsWith(path));

  if (isProtectedRoute) {
    const payload = await verifyToken(sessionToken || '');

    // If there's no valid token, redirect to the login page
    if (!payload) {
      const loginUrl = new URL('/auth', request.url);
      const response = NextResponse.redirect(loginUrl);
      // Clear any invalid cookie
      response.cookies.delete('session_token');
      return response;
    }

    // --- Role-based access control ---

    // Admin routes
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      // If a non-admin tries to access an admin page, redirect to home
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Business routes
    if (pathname.startsWith('/business')) {
      const allowedRoles = ['pharmacy', 'vendor', 'admin'];
      if (!allowedRoles.includes(payload.role)) {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // You can add more role checks here as needed, for example:
    /*
    // Delivery agent routes
    if (pathname.startsWith('/delivery-agents') && payload.role !== 'delivery-agent' && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    */
  }

  // If all checks pass, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - / (the public home page)
   * - /auth (the login page)
   * - /find-medicines (public page)
   */
  matcher: [
    '/admin/:path*',
    '/business/:path*',
    '/delivery-agents/:path*',
    '/orders/:path*',
    '/carechat/:path*',
  ],
};
