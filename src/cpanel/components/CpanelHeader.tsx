'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Database,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CpanelHeader() {
  const { user } = useAuth();

  return (
    <header className="top-navbar" style={{ borderBottom: '1px solid var(--border-subtle)', background: '#050505' }}>
      {/* C-Panel Master Title & Mode */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          background: 'rgba(239, 68, 68, 0.12)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-sm)',
          color: '#ef4444',
          fontSize: '0.72rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em'
        }}>
          <Lock size={13} />
          <span>cPanel Super-Admin</span>
        </div>

        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
          Console d'Administration & Gestion Globale
        </div>
      </div>

      {/* Right Side System Indicators & Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Cloud Sync Health */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: '#34d399',
          background: 'rgba(52, 211, 153, 0.08)',
          border: '1px solid rgba(52, 211, 153, 0.25)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <Database size={13} />
          <span>Supabase & Hostinger : Connecté</span>
        </div>

        {/* Master Identity */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.72rem',
          color: '#ffffff',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid var(--border-subtle)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-sm)'
        }}>
          <ShieldCheck size={13} color="#facc15" />
          <span>{user?.name || 'Daniel Kiboko'} (Super-Admin)</span>
        </div>

        {/* Switch to Operational CRM Workspace */}
        <Link 
          href="/campaigns" 
          className="btn btn-secondary btn-sm"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.75rem',
            padding: '6px 12px',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
          title="Aller sur l'espace client CRM (Campagnes, Prospects, Envois)"
        >
          <ArrowLeft size={14} />
          <span>Espace CRM Client</span>
        </Link>
      </div>
    </header>
  );
}
