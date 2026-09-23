'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Zap,
  Lock
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { campaigns, simulateCampaignSend, emailAccounts } = useCrm();
  const { user, trialStatus, upgradeToPro } = useAuth();
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const defaultAccount = emailAccounts.find(a => a.isDefault) || emailAccounts[0];

  const handleSimulateOutreach = () => {
    if (campaigns.length > 0) {
      simulateCampaignSend(campaigns[0].id);
      setSimulationToast(`Simulation exécutée pour "${campaigns[0].name}" : 12 emails envoyés, 8 ouverts, 1 réponse reçue.`);
      setTimeout(() => setSimulationToast(null), 5000);
    }
  };

  return (
    <header className="top-navbar">
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input 
          type="text" 
          placeholder="Rechercher un prospect, entreprise..." 
          className="input"
          style={{ paddingLeft: '36px', height: '36px', fontSize: '0.82rem' }}
        />
      </div>

      {/* Real-time Status Badges & Quick Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Toast Alert */}
        {simulationToast && (
          <div style={{
            background: '#0a0a0a',
            border: '1px solid #ffffff',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontSize: '0.75rem',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={14} color="#ffffff" />
            {simulationToast}
          </div>
        )}

        {/* Connected Email Pro Indicator */}
        <Link 
          href="/settings/email" 
          className="badge" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            textDecoration: 'none', 
            color: '#ffffff',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid var(--border-subtle)'
          }}
          title="Gérer les comptes d'envoi SMTP"
        >
          <Mail size={13} />
          {defaultAccount ? defaultAccount.email : 'Connecter Email Pro'}
        </Link>

        {/* SaaS Plan / Trial Status Badge */}
        {trialStatus.isSuperAdmin ? (
          <Link
            href="/cpanel/agents"
            className="badge badge-primary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: '#ef4444', 
              color: '#ffffff',
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            title="Accéder au cPanel d'administration globale"
          >
            <ShieldCheck size={13} />
            SUPER-ADMIN (CPANEL)
          </Link>
        ) : trialStatus.isProActive ? (
          <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} />
            ABONNÉ PRO (30 $/MO)
          </span>
        ) : trialStatus.isTrialActive ? (
          <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={13} />
            ESSAI : {trialStatus.daysRemaining}J RESTANTS
          </span>
        ) : (
          <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            ESSAI EXPIRÉ
          </span>
        )}

        {/* Pro Upgrade Quick Button for Trial Users */}
        {!trialStatus.isSuperAdmin && !trialStatus.isProActive && (
          <button 
            onClick={upgradeToPro}
            className="btn btn-primary btn-sm"
            style={{ fontWeight: 700, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Activer l'abonnement à 30 $/mois"
          >
            <Zap size={13} />
            Passer à 30 $/m
          </button>
        )}

        {/* Create Campaign Action */}
        <Link href="/campaigns/new" className="btn btn-secondary btn-sm">
          <Plus size={14} />
          Campagne
        </Link>
      </div>
    </header>
  );
}
