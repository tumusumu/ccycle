'use client';

import { ReactNode } from 'react';

export interface IPageContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
}

export function PageContainer({
  children,
  title,
  className = '',
  noPadding = false,
}: IPageContainerProps) {
  return (
    <main
      className={`
        min-h-screen
        bg-[#EEF2F7]
        ${noPadding ? '' : 'px-4 py-4 pb-24'}
        ${className}
      `}
    >
      <div className="max-w-lg mx-auto">
        {title && (
          <h1 className="text-2xl font-bold text-[#2C3E50] mb-4">{title}</h1>
        )}
        {children}
      </div>
    </main>
  );
}
