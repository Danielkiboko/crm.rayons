'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Plus, 
  Linkedin, 
  Mail, 
  CheckCircle2, 
  Play
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function Header() {
  const { campaigns, simulateCampaignSend } = useCrm();
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  const handleSimulateOutreach = () => {
    if (campaigns.length > 0) {
      simulateCampaignSend(campaigns[0].id);
      setSimulationToast(`Simulation exécutée pour "${campaigns[0].name}" : 12 emails envoyés, 8 ouverts, 1 réponse reçue.`);
      setTimeout(() => setSimulationToast(null), 5000);
    }
  };

  return (
    <header className="top-navbar">
      {/* Search Bar Starlink */}
      <div style={{ position: 'relative', width: '360px' }}>
        <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
        <input 
          type="text" 
          placeholder="Rechercher un prospect, entreprise, campagne..." 
          className="input"
          style={{ paddingLeft: '36px', height: '36px', fontSize: '0.82rem' }}
        />
      </div>

      {/* Real-time Status Badges & Quick Action - Monochromatic */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
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

        {/* LinkedIn Connection Status */}
        <div className="badge badge-linkedin">
          <Linkedin size={13} />
          LinkedIn Connecté
        </div>

        {/* Email Accounts Rotation */}
        <div className="badge badge-email">
          <Mail size={13} />
          2 Boîtes en Rotation
        </div>

        {/* Simulate Outreach Button */}
        <button 
          onClick={handleSimulateOutreach}
          className="btn btn-secondary btn-sm"
          title="Simuler des interactions et envois en temps réel"
        >
          <Play size={12} fill="#ffffff" />
          Simuler Envoi
        </button>

        {/* Create Campaign Action */}
        <Link href="/campaigns/new" className="btn btn-primary btn-sm">
          <Plus size={14} />
          Nouvelle Campagne
        </Link>
      </div>
    </header>
  );
}
