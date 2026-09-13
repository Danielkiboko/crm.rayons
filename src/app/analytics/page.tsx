'use client';

import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Send, 
  MailOpen, 
  MessageSquare, 
  Sparkles, 
  Linkedin, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Users,
  Layers
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function AnalyticsPage() {
  const { campaigns, deals, leads } = useCrm();

  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + c.openedCount, 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + c.clickedCount, 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + c.repliedCount, 0);
  const totalInterested = campaigns.reduce((acc, c) => acc + c.interestedCount, 0);
  const pipelineWon = deals.filter(d => d.stage === 'won').reduce((acc, d) => acc + d.value, 0);

  const funnelSteps = [
    { label: 'Prospects Importés', count: leads.length, pct: '100%', color: '#ffffff' },
    { label: 'Messages / Visites Envoyés', count: totalSent, pct: `${Math.min(100, Math.round((totalSent / Math.max(1, leads.length)) * 100))}%`, color: '#e5e5e5' },
    { label: 'Emails Ouverts', count: totalOpened, pct: `${totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0}%`, color: '#d4d4d4' },
    { label: 'Liens Cliqués', count: totalClicked, pct: `${totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0}%`, color: '#a3a3a3' },
    { label: 'Réponses Reçues', count: totalReplied, pct: `${totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0}%`, color: '#ffffff' },
    { label: 'Intérêt Validé / Rdv', count: totalInterested, pct: `${totalReplied > 0 ? Math.round((totalInterested / totalReplied) * 100) : 0}%`, color: '#ffffff' }
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Rapports & Funnels de Conversion
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Analyse comparative de la performance multicanale Cold Email et LinkedIn.
          </p>
        </div>

        <div className="badge" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
          <CheckCircle2 size={14} /> Synchronisé en direct
        </div>
      </div>

      {/* Cross Channel Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Email Outreach Performance */}
        <div className="card" style={{ borderLeft: '2px solid #ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '4px', background: '#000000', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Mail size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Canal Cold Email</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Multi-inbox rotation active</span>
              </div>
            </div>
            <span className="badge">Délivrabilité 98%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', padding: '16px', background: '#080808', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Taux Ouverture</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                {totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Taux de Clics</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                {totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0}%
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Taux Réponse</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                {totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0}%
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Outreach Performance */}
        <div className="card" style={{ borderLeft: '2px solid #ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '4px', background: '#000000', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                <Linkedin size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Canal LinkedIn Automation</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Visites & Invitations</span>
              </div>
            </div>
            <span className="badge">Acceptation 42%</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', padding: '16px', background: '#080808', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Visites Profil</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>148</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Acceptation</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>42.5%</div>
            </div>
            <div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Réponse Chat</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>28.6%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Section */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Entonnoir Global de Prospection</h2>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Progression des prospects vers l'opportunité signée</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {funnelSteps.map((step, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ width: '220px', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>
                {step.label}
              </div>

              {/* Monochromatic Progress Bar */}
              <div style={{ flex: 1, height: '24px', background: '#080808', border: '1px solid var(--border-subtle)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  width: `${Math.max(8, parseInt(step.pct))}%`,
                  height: '100%',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: '10px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  color: '#000000',
                  transition: 'width 0.8s ease'
                }}>
                  {step.count}
                </div>
              </div>

              <div style={{ width: '60px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem', color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                {step.pct}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Impact of Lemlist Personalized Images Card - Starlink Style */}
      <div className="card" style={{ background: '#080808', border: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Sparkles size={18} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#ffffff' }}>
            Impact Mesuré des Images Personnalisées (A/B Test)
          </h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Comparaison entre les emails avec visuels personnalisés et les emails en texte brut :
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#000000', borderRadius: 'var(--radius-sm)', border: '1px solid #ffffff' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>Variation A (Avec Image Personnalisée)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>26.4% de réponse</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>+170% de rendez-vous qualifiés générés</div>
          </div>

          <div style={{ padding: '16px', background: '#000000', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '6px' }}>Variation B (Texte brut standard)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a3a3a3', fontFamily: 'Space Grotesk' }}>9.8% de réponse</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Moyenne standard du secteur</div>
          </div>
        </div>
      </div>
    </div>
  );
}
