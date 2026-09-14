'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Send, 
  Users, 
  Flame, 
  Inbox, 
  KanbanSquare, 
  Layers,
  LogOut,
  Lock,
  Mail,
  Radio,
  Sliders
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { useAuth } from '@/context/AuthContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { messages, warmupConfig } = useCrm();
  const { user, logout } = useAuth();

  const unreadMessagesCount = messages.filter(m => !m.read).length;

  const isSuperAdmin = user?.role === 'superadmin' || 
    user?.email?.toLowerCase() === 'danielkiboko218@gmail.com' ||
    user?.email?.toLowerCase() === 'crm@rayons.net';

  return (
    <aside className="sidebar">
      {/* Brand Header */}
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
            CRM RAYONS
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span className="live-dot" style={{ width: '5px', height: '5px' }}></span>
            SMPP & OUTREACH SAAS
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '18px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        
        {/* SUPER-ADMIN HIGHLIGHTED BANNER */}
        {isSuperAdmin && (
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 6px' }}>
              Administration Centrale
            </div>
            <Link
              href="/admin/users"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                background: pathname.startsWith('/admin') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                border: pathname.startsWith('/admin') ? '1px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.12)',
                fontWeight: 700,
                fontSize: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Lock size={16} />
                <span>C-Panel & Abonnements</span>
              </div>
              <span className="badge badge-primary" style={{ fontSize: '0.62rem' }}>
                MAÎTRE
              </span>
            </Link>
          </div>
        )}

        {/* OUTREACH ENGINE ALL-IN-ONE */}
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 8px 6px' }}>
          Canaux d'Expédition
        </div>

        {[
          { name: 'Campagnes All-in-One', href: '/campaigns', icon: Send, badge: null },
          { name: 'Routes Télécom (SMS & RCS)', href: '/settings/telecom', icon: Radio, badge: 'SMPP' },
          { name: 'E-mails (Standard Lemlist)', href: '/settings/email', icon: Mail, badge: 'SMTP' },
          { name: 'Unibox Hub', href: '/unibox', icon: Inbox, badge: unreadMessagesCount > 0 ? unreadMessagesCount : null }
        ].map((item) => {
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
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #ffffff' : '2px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? '#ffffff' : 'currentColor'} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="badge" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* PROSPECTS & SALES CRM */}
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 8px 6px' }}>
          Gestion & Ventes
        </div>

        {[
          { name: 'Base Prospects & Leads', href: '/leads', icon: Users, badge: null },
          { name: 'Pipeline Ventes CRM', href: '/crm', icon: KanbanSquare, badge: null },
          { name: 'Lemwarm Délivrabilité', href: '/warmup', icon: Flame, badge: `${warmupConfig.currentScore}%` }
        ].map((item) => {
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
                padding: '9px 12px',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                borderLeft: isActive ? '2px solid #ffffff' : '2px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.84rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={16} color={isActive ? '#ffffff' : 'currentColor'} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="badge" style={{ padding: '2px 6px', fontSize: '0.65rem' }}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border-subtle)', background: '#000000' }}>
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
                  {isSuperAdmin ? 'Super-Admin' : 'Client'}
                </span>
                <span>{user?.companyName || 'CRM Rayons'}</span>
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
              borderRadius: 'var(--radius-sm)'
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
