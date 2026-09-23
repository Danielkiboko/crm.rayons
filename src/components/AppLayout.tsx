'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import AuthGuard from '@/components/AuthGuard';
import PaywallModal from '@/components/PaywallModal';
import CpanelLayout from '@/components/CpanelLayout';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  const isLoginPage = pathname === '/login';

  return (
    <AuthGuard>
      {isLoginPage ? (
        <main>{children}</main>
      ) : pathname.startsWith('/cpanel') ? (
        <CpanelLayout>{children}</CpanelLayout>
      ) : (
        <div className="app-container">
          <Sidebar />
          <div className="main-content">
            <Header />
            <main className="page-body">
              {children}
            </main>
          </div>
          <PaywallModal />
        </div>
      )}
    </AuthGuard>
  );
}
