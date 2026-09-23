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
  Radio
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CpanelSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '4px',
          background: '#ef4444',
          border: '1px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            cPANEL
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            GESTION GLOBALE
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '18px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 6px' }}>
          Administration SaaS
        </div>
        
        <Link href="/cpanel/agents" className={`nav-link ${pathname.startsWith('/cpanel/agents') ? 'active' : ''}`}>
          <Users size={18} />
          <span>Clients & Utilisateurs</span>
        </Link>
        
        <Link href="/cpanel/subscriptions" className={`nav-link ${pathname.startsWith('/cpanel/subscriptions') ? 'active' : ''}`}>
          <CreditCard size={18} />
          <span>Abonnements & Licences</span>
        </Link>
        
        <Link href="/cpanel/telecom" className={`nav-link ${pathname.startsWith('/cpanel/telecom') ? 'active' : ''}`}>
          <Radio size={18} />
          <span>Routes Télécom (SMS/RCS)</span>
        </Link>

        <Link href="/cpanel/settings" className={`nav-link ${pathname.startsWith('/cpanel/settings') ? 'active' : ''}`}>
          <Settings size={18} />
          <span>Paramètres & Sécurité</span>
        </Link>

      </nav>

      {/* Footer User Info & Exit */}
      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div className="avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
              {user?.name || 'Daniel Kiboko'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#ef4444', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>
              Super Admin
            </div>
          </div>
        </div>

        <Link 
          href="/campaigns"
          className="btn btn-outline" 
          style={{ width: '100%', justifyContent: 'center', marginBottom: '8px', padding: '8px 0', fontSize: '0.8rem' }}
        >
          <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Espace Traitement CRM
        </Link>

        <button 
          onClick={logout}
          className="btn" 
          style={{ width: '100%', justifyContent: 'center', background: 'transparent', color: 'var(--text-subtle)' }}
        >
          <LogOut size={16} style={{ marginRight: '6px' }} /> Déconnexion
        </button>
      </div>
    </aside>
  );
}
