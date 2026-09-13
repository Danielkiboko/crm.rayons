'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Send, 
  Sparkles, 
  Users, 
  Flame, 
  Inbox, 
  KanbanSquare, 
  BarChart3, 
  Settings, 
  Layers,
  LogOut,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { messages, warmupConfig } = useCrm();
  const { user, logout } = useAuth();

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  const navItems = [
    {
      name: 'Cockpit',
      href: '/',
      icon: LayoutDashboard,
      badge: null
    },
    {
      name: 'Campagnes',
      href: '/campaigns',
      icon: Send,
      badge: null
    },
    {
      name: 'Images Dynamiques',
      href: '/personalization',
      icon: Sparkles,
      badge: 'PRO'
    },
    {
      name: 'Base Leads & CSV',
      href: '/leads',
      icon: Users,
      badge: null
    },
    {
      name: 'Vérificateur Emails',
      href: '/verifier',
      icon: ShieldCheck,
      badge: 'NOUVEAU'
    },
    {
      name: 'Lemwarm & Audit',
      href: '/warmup',
      icon: Flame,
      badge: `${warmupConfig.currentScore}%`
    },
    {
      name: 'Unibox Hub',
      href: '/unibox',
      icon: Inbox,
      badge: unreadMessagesCount > 0 ? unreadMessagesCount : null
    },
    {
      name: 'Pipeline CRM',
      href: '/crm',
      icon: KanbanSquare,
      badge: null
    },
    {
      name: 'Rapports & Funnels',
      href: '/analytics',
      icon: BarChart3,
      badge: null
    },
    {
      name: 'Accès & cPanel',
      href: '/admin/users',
      icon: Lock,
      badge: 'ADMIN'
    }
  ];

  return (
    <aside className="sidebar">
      {/* Brand / Logo Starlink Style */}
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '4px',
          background: '#000000',
          border: '1px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
          <Layers size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
            LEMFLOW
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span className="live-dot" style={{ width: '5px', height: '5px' }}></span>
            Système Actif
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 8px' }}>
          Navigation
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #ffffff' : '2px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem',
                transition: 'var(--transition)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={18} color={isActive ? '#ffffff' : 'currentColor'} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="badge" style={{ padding: '2px 6px', fontSize: '0.68rem' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Connected Account & Deliverability Widget - Monochrome */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-subtle)', background: '#000000' }}>
        <div style={{
          background: '#080808',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score Lemwarm</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
              {warmupConfig.currentScore} / 100
            </div>
          </div>
          <div style={{ width: '30px', height: '30px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Flame size={16} />
          </div>
        </div>

        {/* User Profile Card with Logout */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '4px',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.75rem',
              color: '#ffffff',
              flexShrink: 0
            }}>
              {user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'DK'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Daniel Kiboko'}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="badge" style={{ padding: '1px 5px', fontSize: '0.6rem' }}>
                  {user?.role === 'admin' ? 'Admin' : 'Sales'}
                </span>
                <span>{user?.companyName || 'LemFlow'}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (confirm('Voulez-vous vous déconnecter ?')) {
                logout();
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-subtle)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
