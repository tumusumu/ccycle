'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TGender } from '@/types/user';

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');

  // Form data
  const [birthYear, setBirthYear] = useState<number | null>(null);
  const [gender, setGender] = useState<TGender>('MALE');
  const [weight, setWeight] = useState<number>(70);
  const [bodyFat, setBodyFat] = useState<number>(25);

  // Calculate age from birth year
  const currentYear = new Date().getFullYear();
  const age = birthYear ? currentYear - birthYear : null;

  // Generate year options (18-80 years old range)
  const yearOptions = useMemo(() => {
    const options = [{ value: '', label: '请选择出生年份' }];
    for (let year = currentYear - 18; year >= currentYear - 80; year--) {
      options.push({ value: String(year), label: `${year}年` });
    }
    return options;
  }, [currentYear]);

  const genderOptions = [
    { value: 'MALE', label: '男性' },
    { value: 'FEMALE', label: '女性' },
  ];

  // 获取当前用户信息
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const userData = await res.json();
          setCurrentUsername(userData.username);
          
          // 如果用户已经完善了信息，检查是否需要跳转
          if (userData.weight > 0 && userData.bodyFatPercentage > 0) {
            // 用户已经完成 onboarding，跳转到创建计划或仪表板
            router.push('/plan/new');
            return;
          }
        } else if (res.status === 404) {
          // 用户不存在，跳转到注册
          router.push('/register');
        }
      } catch {
        setError('获取用户信息失败，请刷新页面重试');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [router]);

  const isFormValid = () => {
    return (
      birthYear &&
      age !== null &&
      age >= 18 &&
      age <= 80 &&
      weight >= 40 &&
      weight <= 150 &&
      bodyFat >= 5 &&
      bodyFat <= 45
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError(null);

    try {
      // 更新用户信息（PUT 而不是 POST）
      const res = await fetch('/api/user', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          birthYear,
          gender,
          weight,
          bodyFatPercentage: bodyFat / 100,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '保存失败');
      }

      // 跳转到计划创建页面
      router.push('/plan/new');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingUser) {
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
        {/* 欢迎信息 */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">👋</div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">
            欢迎，{currentUsername}！
          </h1>
          <p className="text-[#5D6D7E] mt-2">请完善您的个人信息，开启碳循环之旅</p>
        </div>

        {error && (
          <Card variant="warning" className="mb-4">
            <p className="text-[#E74C3C]">{error}</p>
          </Card>
        )}

        <Card className="space-y-4">
          <div className="pb-4 border-b border-[#D5DBDB]">
            <h2 className="text-lg font-semibold text-[#2C3E50]">基本信息</h2>
            <p className="text-sm text-[#5D6D7E] mt-1">
              这些信息将用于计算您的个性化碳循环计划
            </p>
          </div>

          {/* Birth Year */}
          <div>
            <Select
              label="出生年份"
              options={yearOptions}
              value={birthYear ? String(birthYear) : ''}
              onChange={(v) => setBirthYear(v ? parseInt(v, 10) : null)}
            />
            {age !== null && (
              <p className="text-sm text-[#5D6D7E] mt-1">
                年龄：{age} 岁
              </p>
            )}
          </div>

          {/* Gender */}
          <Select
            label="性别"
            options={genderOptions}
            value={gender}
            onChange={(v) => setGender(v as TGender)}
          />

          <div className="pt-4 pb-2 border-t border-[#D5DBDB]">
            <h2 className="text-lg font-semibold text-[#2C3E50]">身体数据</h2>
            <p className="text-sm text-[#5D6D7E] mt-1">
              请如实填写，这将影响计划的准确性
            </p>
          </div>

          {/* Weight */}
          <div>
            <Input
              label="当前体重 (kg)"
              type="number"
              value={weight}
              onChange={(v) => setWeight(Number(v))}
              min={40}
              max={150}
              step={0.1}
              error={weight < 40 || weight > 150 ? '体重需在40-150kg之间' : undefined}
            />
          </div>

          {/* Body Fat */}
          <div>
            <Input
              label="当前体脂率 (%)"
              type="number"
              value={bodyFat}
              onChange={(v) => setBodyFat(Number(v))}
              min={5}
              max={45}
              step={0.1}
              error={bodyFat < 5 || bodyFat > 45 ? '体脂率需在5-45%之间' : undefined}
            />
            <p className="text-sm text-[#5D6D7E] mt-1">
              💡 如果不确定，可以使用智能体脂秤测量，或根据外观估算
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!isFormValid()}
            className="w-full mt-6"
          >
            继续创建碳循环计划
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}