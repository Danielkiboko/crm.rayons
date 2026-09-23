'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CpanelSidebar from '@/components/CpanelSidebar';
import CpanelHeader from '@/components/CpanelHeader';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminEmail } from '@/lib/userStore';

export default function CpanelLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin = user?.role === 'superadmin' || isSuperAdminEmail(user?.email);

  useEffect(() => {
    if (!isLoading && !isSuperAdmin) {
      router.replace('/campaigns');
    }
  }, [isLoading, isSuperAdmin, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000', color: 'var(--text-muted)' }}>
        Chargement...
      </div>
    );
  }

  // Le client ne voit pas le C-Panel
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="app-container">
      <CpanelSidebar />
      <div className="main-content">
        <CpanelHeader />
        <main className="page-body">
          {children}
        </main>
      </div>
    </div>
  );
}
