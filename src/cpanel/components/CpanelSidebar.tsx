'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Settings,
  ShieldCheck,
  CreditCard,
  LogOut,
  ArrowLeft,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CpanelSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar" style={{ borderRight: '1px solid rgba(239, 68, 68, 0.25)' }}>
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(239, 68, 68, 0.05)' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '6px',
          background: '#ef4444',
          border: '1px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)'
        }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            cPANEL RAYONS
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            ADMINISTRATION CENTRALE
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '18px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 6px' }}>
          Gestion du Système
        </div>
        
        <Link href="/cpanel/agents" className={`nav-link ${pathname.startsWith('/cpanel/agents') ? 'active' : ''}`}>
          <Users size={18} />
          <span>Comptes Clients & Accès</span>
        </Link>
        
        <Link href="/cpanel/subscriptions" className={`nav-link ${pathname.startsWith('/cpanel/subscriptions') ? 'active' : ''}`}>
          <CreditCard size={18} />
          <span>Licences & Abonnements</span>
        </Link>
        
        <Link href="/cpanel/telecom" className={`nav-link ${pathname.startsWith('/cpanel/telecom') ? 'active' : ''}`}>
          <Radio size={18} />
          <span>Passerelles SMS & RCS</span>
        </Link>

        <Link href="/cpanel/settings" className={`nav-link ${pathname.startsWith('/cpanel/settings') ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Configuration & Sécurité</span>
        </Link>

      </nav>

      {/* Footer User Info & Exit */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)', background: '#050505' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="avatar" style={{ border: '1px solid #ef4444', color: '#ef4444' }}>
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Daniel Kiboko'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Super-Admin cPanel
            </div>
          </div>
        </div>

        <Link 
          href="/campaigns"
          className="btn btn-outline" 
          style={{ width: '100%', justifyContent: 'center', marginBottom: '8px', padding: '8px 0', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Aller au CRM Client
        </Link>

        <button 
          onClick={logout}
          className="btn" 
          style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: 'var(--text-subtle)' }}
        >
          <LogOut size={16} style={{ marginRight: '6px' }} /> Déconnexion cPanel
        </button>
      </div>
    </aside>
  );
}
