import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // 验证输入
    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: '用户名至少需要3个字符' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少需要6个字符' },
        { status: 400 }
      );
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 409 }
      );
    }

    // 加密密码（bcrypt 自动加盐，盐轮数为 10）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户（注意：这里只创建了基本信息，其他字段需要在 onboarding 流程中补充）
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        // 设置为0表示需要在 onboarding 中填写
        birthYear: 2000,
        gender: 'MALE',
        weight: 0,
        bodyFatPercentage: 0,
      },
    });

    // 注册成功后自动登录 - 设置双重 cookie
    const cookieStore = await cookies();
    
    // 1. httpOnly cookie（服务端认证用，安全）
    cookieStore.set('ccycle_user_id', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30天
    });

    // 2. 客户端可读 cookie（用于 localStorage key 生成，非敏感）
    cookieStore.set('ccycle_user_id_client', user.id, {
      httpOnly: false,  // 客户端可读
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30天
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: '注册成功，请完善个人信息',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后再试' },
      { status: 500 }
    );
  }
}