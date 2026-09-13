'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Send, 
  Users, 
  MailOpen, 
  MessageSquare, 
  TrendingUp, 
  ArrowUpRight, 
  Flame, 
  Linkedin, 
  Mail, 
  Sparkles, 
  ChevronRight,
  Play,
  Pause,
  Clock,
  Plus
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function DashboardPage() {
  const { campaigns, leads, messages, deals, warmupConfig, toggleCampaignStatus } = useCrm();

  // Aggregate stats
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + c.openedCount, 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + c.repliedCount, 0);
  const totalInterested = campaigns.reduce((acc, c) => acc + c.interestedCount, 0);
  
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const avgReplyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
  const pipelineValue = deals.reduce((acc, d) => acc + d.value, 0);

  const unreadMessages = messages.filter(m => !m.read);

  return (
    <div>
      {/* Welcome & Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            Cockpit Multicanal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Supervision des flux de prospection Cold Email, séquences LinkedIn et score de délivrabilité.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/personalization" className="btn btn-secondary">
            <Sparkles size={15} />
            Studio d'Images
          </Link>
          <Link href="/campaigns/new" className="btn btn-primary">
            <Plus size={15} />
            Lancer une Campagne
          </Link>
        </div>
      </div>

      {/* KPI Metrics Cards - Starlink Style */}
      <div className="metrics-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Total Envoyés</span>
            <div className="stat-card-icon">
              <Send size={16} />
            </div>
          </div>
          <div className="stat-value">{totalSent}</div>
          <div className="stat-subtext">
            <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={13} /> +18%
            </span>
            cette semaine
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Taux d'Ouverture</span>
            <div className="stat-card-icon">
              <MailOpen size={16} />
            </div>
          </div>
          <div className="stat-value">{avgOpenRate}%</div>
          <div className="stat-subtext">
            <span>Moyenne secteur : 42%</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Taux de Réponse</span>
            <div className="stat-card-icon">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="stat-value">{avgReplyRate}%</div>
          <div className="stat-subtext">
            <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={13} /> {totalReplied} réponses
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Valeur Pipeline CRM</span>
            <div className="stat-card-icon">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="stat-value">
            {pipelineValue.toLocaleString('fr-FR')} €
          </div>
          <div className="stat-subtext">
            <span>{deals.length} opportunités actives</span>
          </div>
        </div>
      </div>

      {/* Grid: Active Campaigns & Lemwarm Deliverability */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Campaigns Overview */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Campagnes Multicanales</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Séquences automatisées Email + LinkedIn</p>
            </div>
            <Link href="/campaigns" className="btn btn-secondary btn-sm">
              Voir tout ({campaigns.length})
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {campaigns.map((camp) => {
              const openRate = camp.sentCount > 0 ? Math.round((camp.openedCount / camp.sentCount) * 100) : 0;
              const replyRate = camp.sentCount > 0 ? Math.round((camp.repliedCount / camp.sentCount) * 100) : 0;

              return (
                <div
                  key={camp.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: '#080808',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className="badge">
                        {camp.status === 'active' ? (
                          <>
                            <span className="live-dot" style={{ width: '5px', height: '5px' }}></span>
                            Active
                          </>
                        ) : 'Pause'}
                      </span>
                      <h3 style={{ fontSize: '0.92rem', fontWeight: 600 }}>{camp.name}</h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                      <span>{camp.steps.length} étapes</span>
                      <span>•</span>
                      <span>{camp.leadsCount} prospects</span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {camp.scheduleStartTime} - {camp.scheduleEndTime}
                      </span>
                    </div>
                  </div>

                  {/* Funnel Metrics */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Envoyés</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{camp.sentCount}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Ouverts</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{openRate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Répondus</div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{replyRate}%</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button 
                        onClick={() => toggleCampaignStatus(camp.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px 8px' }}
                        title={camp.status === 'active' ? 'Mettre en pause' : 'Reprendre la campagne'}
                      >
                        {camp.status === 'active' ? <Pause size={13} /> : <Play size={13} fill="#ffffff" />}
                      </button>
                      <Link href={`/campaigns/${camp.id}`} className="btn btn-secondary btn-sm" style={{ padding: '6px 8px' }}>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lemwarm Deliverability Card - Starlink Minimalist */}
        <div className="card">
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Flame size={18} />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Lemwarm & Réputation</h2>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Audit délivrabilité & SPF/DKIM/DMARC</p>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '16px 0 24px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              margin: '0 auto',
              background: 'conic-gradient(#ffffff 0% 98%, rgba(255,255,255,0.15) 98% 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '104px',
                height: '104px',
                borderRadius: '50%',
                background: '#0a0a0a',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                  {warmupConfig.currentScore}
                </span>
                <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Optimal</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#050505', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Boîte</span>
              <span style={{ fontWeight: 600 }}>{warmupConfig.mailboxEmail}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#050505', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Placement Boîte Principale</span>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>{warmupConfig.inboxPlacementRate}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#050505', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Protocoles DNS</span>
              <span className="badge" style={{ padding: '2px 6px' }}>Validés (Pass)</span>
            </div>
          </div>

          <Link href="/warmup" className="btn btn-secondary" style={{ width: '100%', marginTop: '20px' }}>
            Gérer la Chauffe & DNS
          </Link>
        </div>
      </div>

      {/* Lower Section: Unibox Highlights & Sales Pipeline Quick Access */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Unibox Recent Replies */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Dernières Réponses (Unibox)</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Messages entrants et détection de sentiment</p>
            </div>
            <Link href="/unibox" className="btn btn-secondary btn-sm">
              Ouvrir Unibox
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.slice(0, 3).map((msg) => (
              <div 
                key={msg.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#080808',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '12px'
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '4px',
                  background: '#000000',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  {msg.channel === 'linkedin' ? <Linkedin size={16} /> : <Mail size={16} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{msg.leadName} • {msg.leadCompany}</div>
                    <span className="badge">
                      {msg.sentiment === 'meeting_booked' ? 'Rdv réservé' : 'Intéressé'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {msg.snippet}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CRM Pipeline Quick View */}
        <div className="card">
          <div className="card-header">
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Deals en Cours</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Opportunités commerciales actives</p>
            </div>
            <Link href="/crm" className="btn btn-secondary btn-sm">
              Voir le Kanban
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {deals.slice(0, 3).map((deal) => (
              <div
                key={deal.id}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  background: '#080808',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>{deal.title}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    Contact : {deal.leadName} • Échéance : {deal.expectedCloseDate}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                    {deal.value.toLocaleString('fr-FR')} €
                  </div>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>
                    {deal.stage === 'demo_booked' ? 'Démo planifiée' : deal.stage}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
