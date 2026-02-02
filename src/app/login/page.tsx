'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { setCurrentUserId } from '@/hooks/use-current-user';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!username.trim()) {
      setError('请输入用户名');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if user exists
      const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
      const data = await res.json();

      if (data.valid) {
        // User doesn't exist
        setError('用户不存在，请先注册');
        return;
      }

      if (data.userId) {
        // User exists, set the user ID and redirect
        setCurrentUserId(data.userId);
        router.push('/dashboard');
      } else {
        setError('登录失败，请稍后再试');
      }
    } catch {
      setError('登录失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col justify-center py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50]">CCycle 碳循112</h1>
          <p className="text-[#5D6D7E] mt-2">登录您的账户</p>
        </div>

        {error && (
          <Card variant="warning" className="mb-4">
            <p className="text-[#E74C3C]">{error}</p>
          </Card>
        )}

        <Card className="space-y-4">
          <Input
            label="用户名"
            type="text"
            value={username}
            onChange={(v) => setUsername(String(v))}
            placeholder="请输入用户名"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleLogin();
              }
            }}
          />

          <Button
            onClick={handleLogin}
            loading={isLoading}
            disabled={!username.trim()}
            className="w-full"
          >
            登录
          </Button>

          <div className="text-center pt-4 border-t border-[#D5DBDB]">
            <p className="text-[#5D6D7E] text-sm">
              还没有账户？{' '}
              <Link href="/onboarding" className="text-[#4A90D9] hover:underline">
                立即注册
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
