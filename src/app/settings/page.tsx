'use client';

import { Header } from '@/components/layout/header';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PageContainer } from '@/components/layout/page-container';
import { Card } from '@/components/ui/card';

export default function SettingsPage() {
  return (
    <>
      <Header showLogout />

      <PageContainer className="pt-16 pb-24">
        <h1 className="text-2xl font-bold mb-6">设置</h1>

        {/* 关于 */}
        <Card>
          <h3 className="text-base font-semibold mb-4">关于</h3>
          <div className="space-y-2 text-sm text-[var(--color-body)]">
            <div className="flex justify-between">
              <span>应用名称</span>
              <span className="font-medium">碳循ccycle</span>
            </div>
            <div className="flex justify-between">
              <span>版本号</span>
              <span className="font-medium">v1.0.0</span>
            </div>
          </div>
        </Card>
      </PageContainer>

      <BottomNav />
    </>
  );
}
