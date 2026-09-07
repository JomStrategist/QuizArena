import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.',
    timestamp: new Date().toISOString(),
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0,
  };

  response.cookies.set('quizarena_token', '', cookieOptions);
  response.cookies.set('token', '', cookieOptions);
  response.cookies.set('auth_token', '', cookieOptions);

  return response;
}
