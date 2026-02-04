'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
// setCurrentUserId 已废弃，服务端自动设置 cookie

export default function RegisterPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong' | null>(null);

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
        // 未登录，继续显示注册页面
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [router]);

  // 验证用户名格式
  const validateUsername = (username: string): string | null => {
    if (!username) return '请输入用户名';
    if (username.length < 3) return '用户名至少需要3个字符';
    if (username.length > 20) return '用户名不能超过20个字符';
    if (!/^[a-zA-Z0-9]+$/.test(username)) {
      return '用户名只能包含字母和数字';
    }
    return null;
  };

    // 检查用户名是否已存在
    const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(false);
      return;
    }

    setIsCheckingUsername(true);
    setUsernameAvailable(false);

    try {
        const res = await fetch(`/api/user/check-username?username=${encodeURIComponent(username)}`);
        const data = await res.json();

        if (data.valid) {
        // valid: true 表示用户名可用（不存在）
        setUsernameAvailable(true);
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.username;
            return newErrors;
        });
        } else {
        // valid: false 表示用户名已被使用
        setUsernameAvailable(false);
        setErrors(prev => ({ ...prev, username: data.error || '用户名已被使用' }));
        }
    } catch {
        // 忽略检查错误
        setUsernameAvailable(false);
    } finally {
        setIsCheckingUsername(false);
    }
    };

  // 计算密码强度
  const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  };

  // 验证密码
  const validatePassword = (password: string): string | null => {
    if (!password) return '请输入密码';
    if (password.length < 6) return '密码至少需要6个字符';
    if (password.length > 50) return '密码不能超过50个字符';
    return null;
  };

  // 处理用户名输入
  const handleUsernameChange = (value: string | number) => {
    const username = String(value);
    setFormData(prev => ({ ...prev, username }));
    setUsernameAvailable(false); // 重置可用状态

    const error = validateUsername(username);
    if (error) {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev, username: error };
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
    } else {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev };
        delete newErrors.username;
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
      // 实时检查用户名是否可用
      checkUsernameAvailability(username);
    }
  };

  // 处理密码输入
  const handlePasswordChange = (value: string | number) => {
    const password = String(value);
    setFormData(prev => ({ ...prev, password }));

    if (password) {
      setPasswordStrength(calculatePasswordStrength(password));
    } else {
      setPasswordStrength(null);
    }

    const error = validatePassword(password);
    if (error) {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev, password: error };
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
    } else {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev };
        delete newErrors.password;
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
    }

    // 同时验证确认密码
    if (formData.confirmPassword && password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '两次密码输入不一致' }));
    } else if (formData.confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  };

  // 处理确认密码输入
  const handleConfirmPasswordChange = (value: string | number) => {
    const confirmPassword = String(value);
    setFormData(prev => ({ ...prev, confirmPassword }));

    if (!confirmPassword) {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev, confirmPassword: '请再次输入密码' };
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
    } else if (confirmPassword !== formData.password) {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev, confirmPassword: '两次密码输入不一致' };
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
    } else {
      setErrors(prev => {
        const newErrors: Record<string, string> = { ...prev };
        delete newErrors.confirmPassword;
        delete newErrors.submit; // 清除提交错误
        return newErrors;
      });
    }
  };

  // 提交注册
  const handleRegister = async () => {
    // 最终验证
    const usernameError = validateUsername(formData.username);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = formData.password !== formData.confirmPassword 
      ? '两次密码输入不一致' 
      : null;

    const newErrors: Record<string, string> = {};
    if (usernameError) newErrors.username = usernameError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.userId) {
        // 注册成功（服务端已自动设置 cookie）并跳转到 onboarding
        router.push('/onboarding');
      } else {
        setErrors({ submit: data.error || '注册失败，请稍后再试' });
      }
    } catch {
      setErrors({ submit: '注册失败，请稍后再试' });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    formData.username.trim() !== '' &&
    formData.password !== '' &&
    formData.confirmPassword !== '' &&
    usernameAvailable &&
    !isCheckingUsername &&
    Object.keys(errors).length === 0;

  // 密码强度颜色
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };

  const strengthTexts = {
    weak: '弱',
    medium: '中等',
    strong: '强',
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
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C3E50]">创建账户</h1>
          <p className="text-[#5D6D7E] mt-2">加入 ccycle 开始您的健康之旅</p>
        </div>

        {/* 错误提示 */}
        {errors.submit && (
          <Card variant="warning" className="mb-4">
            <p className="text-[#E74C3C]">{errors.submit}</p>
          </Card>
        )}

        <Card className="space-y-4">
          {/* 用户名 */}
          <div>
            <Input
              label="用户名"
              type="text"
              value={formData.username}
              onChange={handleUsernameChange}
              placeholder="3-20个字符，支持字母数字下划线"
              autoComplete="username"
            />
            {errors.username && (
              <p className="text-xs text-[#E74C3C] mt-1">{errors.username}</p>
            )}
            {isCheckingUsername && (
              <p className="text-xs text-[#5D6D7E] mt-1">检查中...</p>
            )}
            {!isCheckingUsername && usernameAvailable && !errors.username && (
              <p className="text-xs text-[#27AE60] mt-1">✓ 用户名可用</p>
            )}
          </div>

          {/* 密码 */}
          <div>
            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handlePasswordChange}
                placeholder="3-20个字符，仅支持字母和数字"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-[#5D6D7E] hover:text-[#2C3E50]"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            
            {/* 密码强度指示器 */}
            {passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${strengthColors[passwordStrength]}`}
                      style={{ 
                        width: passwordStrength === 'weak' ? '33%' : 
                               passwordStrength === 'medium' ? '66%' : '100%' 
                      }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${
                    passwordStrength === 'weak' ? 'text-red-500' :
                    passwordStrength === 'medium' ? 'text-yellow-500' :
                    'text-green-500'
                  }`}>
                    {strengthTexts[passwordStrength]}
                  </span>
                </div>
              </div>
            )}
            
            {errors.password && (
              <p className="text-xs text-[#E74C3C] mt-1">{errors.password}</p>
            )}
          </div>

          {/* 确认密码 */}
          <div>
            <div className="relative">
              <Input
                label="确认密码"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={handleConfirmPasswordChange}
                placeholder="请再次输入密码"
                autoComplete="new-password"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && isFormValid) {
                    handleRegister();
                  }
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-9 text-[#5D6D7E] hover:text-[#2C3E50]"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-[#E74C3C] mt-1">{errors.confirmPassword}</p>
            )}
            {formData.confirmPassword && !errors.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-xs text-[#27AE60] mt-1">✓ 密码一致</p>
            )}
          </div>

          {/* 注册按钮 */}
          <Button
            onClick={handleRegister}
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            className="w-full"
          >
            注册
          </Button>

          {/* 登录链接 */}
          <div className="text-center pt-4 border-t border-[#D5DBDB]">
            <p className="text-[#5D6D7E] text-sm">
              已有账户？{' '}
              <Link href="/login" className="text-[#4A90D9] hover:underline font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}