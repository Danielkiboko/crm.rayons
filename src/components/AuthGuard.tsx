'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Layers } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/login';

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && !isLoginPage) {
        router.push('/login');
      } else if (isAuthenticated && isLoginPage) {
        router.push('/');
      }
    }
  }, [isAuthenticated, isLoading, isLoginPage, router]);

  // If loading session state, display sleek loader
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: 'white'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '4px',
          background: '#000000',
          border: '1px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <Layers size={24} />
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Vérification des accès sécurisés...
        </div>
      </div>
    );
  }

  // If on login page and not authenticated, render login
  if (isLoginPage) {
    return <>{children}</>;
  }

  // If user is suspended / blocked by Super-Admin
  if (isAuthenticated && user?.status === 'suspended') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '480px',
          padding: '36px',
          background: '#0a0a0a',
          border: '1px solid #ef4444',
          borderRadius: 'var(--radius-md)'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            margin: '0 auto 16px'
          }}>
            <Layers size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
            Compte Suspendu
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
            Votre accès au CRM SaaS a été temporairement suspendu ou bloqué par l'administrateur. Veuillez contacter <span style={{ color: '#ffffff', textDecoration: 'underline' }}>crm@rayons.net</span> pour débloquer votre compte.
          </p>
          <button onClick={logout} className="btn btn-secondary" style={{ width: '100%' }}>
            Se Déconnecter
          </button>
        </div>
      </div>
    );
  }

  // If authenticated and on protected route, render layout & content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return null;
}
