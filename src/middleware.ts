import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('quizarena_token')?.value;

  // Protected Trainer Routes
  if (pathname.startsWith('/trainer')) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/trainer';
      url.searchParams.set('error', 'unauthorized');
      return NextResponse.redirect(url);
    }
    
    // We also decode token role if JWT format permits
    try {
      const base64Url = token.split('.')[1];
      if (base64Url) {
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = JSON.parse(atob(base64));
        if (jsonPayload.role !== 'TRAINER' && jsonPayload.role !== 'ADMIN') {
          const url = req.nextUrl.clone();
          url.pathname = '/auth/trainer';
          url.searchParams.set('error', 'forbidden');
          return NextResponse.redirect(url);
        }
      }
    } catch (e) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/trainer';
      return NextResponse.redirect(url);
    }
  }

  // Protected Student Routes
  if (pathname.startsWith('/student')) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/auth/student';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/trainer/:path*', '/student/:path*'],
};
