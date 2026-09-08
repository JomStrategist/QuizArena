import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('quizarena_token')?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
      { status: 401 }
    );
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' } },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      id: payload.userId,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
    timestamp: new Date().toISOString(),
  });
}
