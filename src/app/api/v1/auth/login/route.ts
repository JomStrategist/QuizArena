import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import { UserModel } from '@/models/User';
import { signToken } from '@/lib/auth/jwt';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();
    const { email, password, role = 'TRAINER', name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Email address is required.' } },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let user = await UserModel.findOne({ email: cleanEmail });

    if (!user) {
      // Auto-provision demo/first-time user if credentials provided
      const passwordHash = password ? await bcrypt.hash(password, 10) : undefined;
      const defaultName = name || (cleanEmail.split('@')[0].toUpperCase());
      user = await UserModel.create({
        email: cleanEmail,
        name: defaultName,
        role: role === 'STUDENT' ? 'STUDENT' : 'TRAINER',
        passwordHash,
      });
    } else if (password && user.passwordHash) {
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid password.' } },
          { status: 401 }
        );
      }
    }

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      timestamp: new Date().toISOString(),
    });

    response.cookies.set('quizarena_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error.message || 'Authentication failed.' } },
      { status: 500 }
    );
  }
}
