'use client';

import { ReactNode } from 'react';
import { IntakeProvider } from '@/context/intake-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <IntakeProvider>{children}</IntakeProvider>
  );
}
