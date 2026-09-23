'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import CpanelSidebar from './CpanelSidebar';
import CpanelHeader from './CpanelHeader';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminEmail } from '@/lib/userStore';

export default function CpanelLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isCpanelLoginPage = pathname === '/cpanel/login';
  const isSuperAdmin = user?.role === 'superadmin' || isSuperAdminEmail(user?.email);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isCpanelLoginPage) {
        router.replace('/cpanel/login');
      } else if (isAuthenticated && !isSuperAdmin && !isCpanelLoginPage) {
        router.replace('/campaigns');
      }
    }
  }, [isLoading, isAuthenticated, isSuperAdmin, isCpanelLoginPage, router]);

  // Si on est sur la page de connexion cPanel
  if (isCpanelLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#ffffff'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '4px',
          background: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px',
          fontWeight: 800
        }}>
          CP
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Vérification des accreditations cPanel Super-Admin...
        </div>
      </div>
    );
  }

  // Si non autorisé (utilisateur client essayant d'accéder au cPanel)
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
