'use client';

import React, { useState } from 'react';
import { 
  Flame, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  TrendingUp, 
  Mail, 
  Sliders, 
  Info, 
  Server,
  Lock,
  FileCheck
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function WarmupPage() {
  const { warmupConfig, updateWarmupConfig, simulateWarmupRound } = useCrm();
  const [isSimulating, setIsSimulating] = useState(false);
  const [testNotice, setTestNotice] = useState<string | null>(null);

  const handleSimulateCycle = () => {
    setIsSimulating(true);
    setTimeout(() => {
      simulateWarmupRound();
      setIsSimulating(false);
      setTestNotice('Cycle de chauffe complété : 2 emails échangés avec le réseau de confiance, réputation renforcée !');
      setTimeout(() => setTestNotice(null), 4000);
    }, 800);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Lemwarm & Délivrabilité Email</h1>
            <span className="badge badge-success">
              <Flame size={14} color="#f97316" /> Actif depuis {warmupConfig.daysActive} jours
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Protégez votre nom de domaine et atterrissez toujours dans la boîte de réception principale de vos prospects.
          </p>
        </div>

        <button 
          onClick={handleSimulateCycle}
          disabled={isSimulating}
          className="btn btn-primary"
        >
          <RefreshCw size={16} className={isSimulating ? 'spin-anim' : ''} />
          {isSimulating ? 'Chauffe en cours...' : 'Exécuter un Cycle Lemwarm'}
        </button>
      </div>

      {testNotice && (
        <div style={{
          padding: '12px 18px',
          background: '#080808',
          border: '1px solid #ffffff',
          borderRadius: 'var(--radius-sm)',
          color: '#ffffff',
          fontSize: '0.82rem',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={16} />
          {testNotice}
        </div>
      )}

      {/* Top 3 Metric Cards - Starlink Monochromatic */}
      <div className="metrics-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr', marginBottom: '28px' }}>
        {/* Score Card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '85px',
            height: '85px',
            borderRadius: '50%',
            background: 'conic-gradient(#ffffff 0% 98%, rgba(255,255,255,0.15) 98% 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: '#0a0a0a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              fontWeight: 800,
              fontFamily: 'Space Grotesk',
              color: '#ffffff'
            }}>
              {warmupConfig.currentScore}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Score Global Lemwarm</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', textTransform: 'uppercase' }}>Optimal</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Boîte 100% sécurisée pour l'outbound</div>
          </div>
        </div>

        {/* Placement Inbox */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Boîte de Réception</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="stat-value">{warmupConfig.inboxPlacementRate}%</div>
          <div className="stat-subtext">Atterrissage garanti</div>
        </div>

        {/* Spam Rate */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Taux de Spam</span>
            <AlertTriangle size={16} />
          </div>
          <div className="stat-value">{warmupConfig.spamRate}%</div>
          <div className="stat-subtext">Objectif &lt; 2.0%</div>
        </div>

        {/* Promo Tab */}
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Onglet Promotions</span>
            <Info size={16} />
          </div>
          <div className="stat-value">{warmupConfig.promoRate}%</div>
          <div className="stat-subtext">Quasi-nul</div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '28px' }}>
        {/* Left: DNS Security Audit & Technical Checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Audit Technique DNS (SPF / DKIM / DMARC)</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Configuration obligatoire pour que Google Workspace et Microsoft 365 ne classent pas vos emails en spam.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* SPF */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <ShieldCheck size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>SPF (Sender Policy Framework)</div>
                    <code style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>v=spf1 include:_spf.google.com ~all</code>
                  </div>
                </div>
                <span className="badge badge-success">Validé (Pass)</span>
              </div>

              {/* DKIM */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Lock size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>DKIM (Clé de Signature Cryptographique)</div>
                    <code style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>google._domainkey.company.io (RSA 2048-bit)</code>
                  </div>
                </div>
                <span className="badge badge-success">Validé (Pass)</span>
              </div>

              {/* DMARC */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileCheck size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>DMARC Policy</div>
                    <code style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>v=DMARC1; p=quarantine; rua=mailto:dmarc@company.io</code>
                  </div>
                </div>
                <span className="badge badge-success">Validé (Pass)</span>
              </div>

              {/* Custom Tracking Domain */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Server size={20} color="#10b981" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Custom Tracking Domain (CNAME dédié)</div>
                    <code style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>track.company.io -&gt; custom.lemlistdns.com</code>
                  </div>
                </div>
                <span className="badge badge-success">Actif</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Ramp-up Settings & Parameters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Progression & Réglages Lemwarm</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="label">Boîte mail active</label>
                <div style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} color="#fbbf24" />
                  {warmupConfig.mailboxEmail}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label className="label" style={{ margin: 0 }}>Volume de chauffe quotidien</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8' }}>
                    {warmupConfig.dailyWarmupSent} / {warmupConfig.dailyWarmupTarget} emails
                  </span>
                </div>
                {/* Progress bar */}
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${(warmupConfig.dailyWarmupSent / warmupConfig.dailyWarmupTarget) * 100}%`,
                    height: '100%',
                    background: 'var(--primary-gradient)',
                    borderRadius: '999px'
                  }}></div>
                </div>
              </div>

              <div>
                <label className="label">Vitesse de montée en charge</label>
                <select 
                  value={warmupConfig.rampUpSpeed} 
                  onChange={(e) => updateWarmupConfig({ rampUpSpeed: e.target.value as any })}
                  className="select"
                >
                  <option value="slow">Lente (+1 email/jour - Conseillé pour domaines neufs)</option>
                  <option value="balanced">Équilibrée (+2 emails/jour - Recommandé)</option>
                  <option value="fast">Rapide (+4 emails/jour)</option>
                </select>
              </div>

              <div style={{ padding: '14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                🛡️ <strong>Réseau d'échange Lemwarm</strong> : Vos adresses s'envoient automatiquement des emails avec d'autres utilisateurs certifiés, les marquent comme importants et répondent avec du texte naturel pour créer une réputation irréprochable.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
