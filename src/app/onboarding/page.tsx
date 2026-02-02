'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TGender } from '@/types/user';
import { setCurrentUserId } from '@/hooks/use-current-user';

const USERNAME_REGEX = /^[a-zA-Z0-9]{4,20}$/;

const genderOptions = [
  { value: 'MALE', label: '男性' },
  { value: 'FEMALE', label: '女性' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
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

  // Debounced username validation
  useEffect(() => {
    if (!username) {
      setUsernameError(null);
      return;
    }

    // Check format first
    if (!USERNAME_REGEX.test(username)) {
      if (username.length < 4) {
        setUsernameError('用户名至少需要4个字符');
      } else if (username.length > 20) {
        setUsernameError('用户名最多20个字符');
      } else {
        setUsernameError('用户名只能包含字母和数字');
      }
      return;
    }

    // Check availability with debounce
    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      try {
        const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();
        if (!data.valid) {
          setUsernameError(data.error);
        } else {
          setUsernameError(null);
        }
      } catch {
        setUsernameError('验证失败，请稍后再试');
      } finally {
        setIsCheckingUsername(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const isFormValid = () => {
    return (
      username &&
      !usernameError &&
      !isCheckingUsername &&
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
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          birthYear,
          gender,
          weight,
          bodyFatPercentage: bodyFat / 100,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      // Store user ID for authentication
      setCurrentUserId(data.id);

      // Redirect to plan creation page
      router.push('/plan/new');
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后再试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col justify-center py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50]">CCycle 碳循112</h1>
          <p className="text-[#5D6D7E] mt-2">创建账户，开启碳循环之旅</p>
        </div>

        {error && (
          <Card variant="warning" className="mb-4">
            <p className="text-[#E74C3C]">{error}</p>
          </Card>
        )}

        <Card className="space-y-4">
          {/* Username */}
          <div>
            <Input
              label="用户名"
              type="text"
              value={username}
              onChange={(v) => setUsername(String(v))}
              placeholder="4-20个字母或数字"
              error={usernameError || undefined}
            />
            {isCheckingUsername && (
              <p className="text-sm text-[#5D6D7E] mt-1">正在验证...</p>
            )}
            {!usernameError && username && USERNAME_REGEX.test(username) && !isCheckingUsername && (
              <p className="text-sm text-[#27AE60] mt-1">用户名可用</p>
            )}
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
              如果不确定，可以使用智能体脂秤测量，或根据外观估算
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            loading={isLoading}
            disabled={!isFormValid()}
            className="w-full mt-6"
          >
            注册
          </Button>
        </Card>
      </div>
    </PageContainer>
  );
}
