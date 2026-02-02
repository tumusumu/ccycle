'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { MetricInputForm } from '@/components/metrics/metric-input-form';
import { IBodyMetricsInput } from '@/types/user';

export default function CompletionPage() {
  const router = useRouter();
  const [followedPlan, setFollowedPlan] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'confirm' | 'metrics'>('confirm');

  const handleConfirm = () => {
    setStep('metrics');
  };

  const handleSubmitMetrics = async (data: IBodyMetricsInput) => {
    setIsLoading(true);

    try {
      // Record body metrics
      await fetch('/api/body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      // Mark day as complete (only if plan has started and has mealPlan)
      const todayRes = await fetch('/api/daily-plan/today');
      if (todayRes.ok) {
        const todayData = await todayRes.json();
        if (todayData.mealPlan?.id) {
          await fetch(`/api/intake/${todayData.mealPlan.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              markComplete: { followedPlan },
            }),
          });
        }
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Failed to complete:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-screen flex flex-col justify-center">
        {step === 'confirm' && (
          <>
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-[#2C3E50]">
                恭喜完成今日打卡!
              </h1>
              <p className="text-[#5D6D7E] mt-2">
                坚持就是胜利,继续加油!
              </p>
            </div>

            <Card className="mb-4">
              <Checkbox
                label="今天完全按照计划执行"
                checked={followedPlan}
                onChange={setFollowedPlan}
                size="lg"
              />
              {!followedPlan && (
                <p className="text-sm text-[#5D6D7E] mt-2 ml-8">
                  没关系,明天继续努力!
                </p>
              )}
            </Card>

            <Button onClick={handleConfirm} className="w-full">
              继续记录体重
            </Button>
          </>
        )}

        {step === 'metrics' && (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-[#2C3E50]">
                记录今日体重
              </h1>
              <p className="text-[#5D6D7E] mt-1">
                追踪变化,见证进步
              </p>
            </div>

            <Card>
              <MetricInputForm
                onSubmit={handleSubmitMetrics}
                isLoading={isLoading}
              />
            </Card>

            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              跳过,稍后记录
            </Button>
          </>
        )}
      </div>
    </PageContainer>
  );
}
