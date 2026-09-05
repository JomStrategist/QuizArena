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
    
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
          base64 += '=';
        }
        const jsonPayload = JSON.parse(atob(base64));
        if (jsonPayload && jsonPayload.role && jsonPayload.role !== 'TRAINER' && jsonPayload.role !== 'ADMIN') {
          const url = req.nextUrl.clone();
          url.pathname = '/auth/trainer';
          url.searchParams.set('error', 'forbidden');
          return NextResponse.redirect(url);
        }
      }
    } catch (e) {
      console.error('Middleware JWT decode error:', e);
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
