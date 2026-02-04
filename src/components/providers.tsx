'use client';

import { ReactNode } from 'react';
import { IntakeProvider } from '@/context/intake-context';
import { ThemeProvider } from '@/context/theme-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <IntakeProvider>{children}</IntakeProvider>
    </ThemeProvider>
  );
}
