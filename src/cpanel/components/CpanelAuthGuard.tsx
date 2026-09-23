'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminEmail } from '@/lib/userStore';

export default function CpanelAuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === '/cpanel/login';
  const isSuperAdmin = user?.role === 'superadmin' || isSuperAdminEmail(user?.email);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.replace('/cpanel/login');
      } else if (isAuthenticated && !isSuperAdmin && !isLoginPage) {
        router.replace('/campaigns');
      }
    }
  }, [isLoading, isAuthenticated, isSuperAdmin, isLoginPage, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading || !isAuthenticated || !isSuperAdmin) {
    return null;
  }

  return <>{children}</>;
}
