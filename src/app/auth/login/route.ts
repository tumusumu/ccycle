import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: '用户名长度必须在3-20个字符之间' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: '用户名只能包含字母、数字和下划线' },
        { status: 400 }
      );
    }

    if (password.length < 6 || password.length > 50) {
      return NextResponse.json(
        { error: '密码长度必须在6-50个字符之间' },
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

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 只创建用户名和密码，其他信息在 onboarding 中填写
    // 这里需要临时默认值来满足数据库约束
    const user = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
        // 临时默认值，将在 onboarding 中更新
        birthYear: 2000,
        gender: 'MALE',
        weight: 0,
        bodyFatPercentage: 0,
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: '注册成功',
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: '注册失败，请稍后再试' },
      { status: 500 }
    );
  }
}