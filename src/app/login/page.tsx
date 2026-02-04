'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
// setCurrentUserId 已废弃，服务端自动设置 cookie

export default function LoginPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查是否已登录，如果已登录则重定向
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const userData = await res.json();
          // 已登录，根据用户状态重定向
          if (!userData.weight || userData.weight === 0) {
            router.replace('/onboarding');
          } else {
            // 检查是否有计划
            const planRes = await fetch('/api/plan/current');
            const planData = await planRes.json();
            if (planData.ok === false && planData.code === 'NO_PLAN') {
              router.replace('/plan/new');
            } else {
              router.replace('/dashboard');
            }
          }
          return;
        }
      } catch {
        // 未登录，继续显示登录页面
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // 根据用户状态决定登录后跳转位置
  const redirectAfterLogin = async (userId: string) => {
    try {
      // 获取用户信息
      const res = await fetch('/api/user');
      if (!res.ok) {
        router.replace('/onboarding');
        return;
      }

      const userData = await res.json();

      // 检查是否完成 onboarding
      if (!userData.weight || userData.weight === 0) {
        router.replace('/onboarding');
        return;
      }

      // 检查是否有计划
      const planRes = await fetch('/api/plan/current');
      const planData = await planRes.json();
      if (planData.ok === false && planData.code === 'NO_PLAN') {
        router.replace('/plan/new');
        return;
      }

      // 都完成了，跳转到 dashboard
      router.replace('/dashboard');
    } catch {
      // 出错时默认跳转到 onboarding
      router.replace('/onboarding');
    }
  };

  const handleLogin = async () => {
    // 验证表单
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 调用登录API（需要后端验证密码）
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.userId) {
        // 登录成功（服务端已设置 cookie）
        // 根据用户状态决定跳转位置
        await redirectAfterLogin(data.userId);
      } else {
        // 登录失败
        setError(data.error || '用户名或密码错误');
      }
    } catch {
      setError('登录失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  // 检查登录状态中，显示加载
  if (isCheckingAuth) {
    return (
      <PageContainer>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-[#5D6D7E]">加载中...</div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col justify-center py-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 w-20 h-20 rounded-2xl bg-[#EEF2F7] flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="CCycle"
              width={72}
              height={72}
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-xl font-semibold text-[#2C3E50] mb-1">112113碳循环</h1>
          <p className="text-[#5D6D7E] text-sm">登录您的账户</p>
        </div>

        {error && (
          <Card variant="warning" className="mb-4">
            <p className="text-[#E74C3C]">{error}</p>
          </Card>
        )}

        <Card className="space-y-4">
          {/* 用户名输入 */}
          <Input
            label="用户名"
            type="text"
            value={username}
            onChange={(v) => setUsername(String(v))}
            placeholder="请输入用户名"
            autoComplete="username"
          />

          {/* 密码输入 */}
          <div className="relative">
            <Input
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(v) => setPassword(String(v))}
              placeholder="请输入密码（至少6个字符）"
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleLogin();
                }
              }}
            />
            {/* 显示/隐藏密码按钮 */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-[#5D6D7E] hover:text-[#2C3E50]"
              tabIndex={-1}
            >
              {showPassword ? (
                // 眼睛闭合图标
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                // 眼睛睁开图标
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* 登录按钮 */}
          <Button
            onClick={handleLogin}
            loading={isLoading}
            disabled={!username.trim() || !password.trim()}
            className="w-full"
          >
            登录
          </Button>

          {/* 注册链接 */}
          <div className="text-center pt-4 border-t border-[#D5DBDB]">
            <p className="text-[#5D6D7E] text-sm">
              还没有账户？{' '}
              <Link href="/register" className="text-[#4A90D9] hover:underline font-medium">
                立即注册
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
