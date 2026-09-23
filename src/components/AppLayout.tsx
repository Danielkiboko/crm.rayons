'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import CpanelLayout from '@/cpanel/components/CpanelLayout';
import CrmLayout from '@/crm/components/CrmLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === '/login' || pathname === '/cpanel/login';

  return (
    <AuthGuard>
      {isLoginPage ? (
        <main>{children}</main>
      ) : pathname.startsWith('/cpanel') ? (
        <CpanelLayout>{children}</CpanelLayout>
      ) : (
        <CrmLayout>{children}</CrmLayout>
      )}
    </AuthGuard>
  );
}
