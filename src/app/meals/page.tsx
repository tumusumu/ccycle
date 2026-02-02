'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function MealsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#EEF2F7] flex items-center justify-center">
      <div className="text-[#5D6D7E]">跳转中...</div>
    </div>
  );
}
