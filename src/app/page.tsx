'use client';

import React, { useState } from 'react';
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
  Plus,
  BarChart3,
  Inbox,
  Zap,
  Target,
  Activity
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function DashboardPage() {
  const { campaigns, leads, messages, deals, warmupConfig, toggleCampaignStatus } = useCrm();
  const [activeAction, setActiveAction] = useState<string | null>(null);

  // Aggregate stats
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + c.openedCount, 0);
  const totalReplied = campaigns.reduce((acc, c) => acc + c.repliedCount, 0);
  const totalInterested = campaigns.reduce((acc, c) => acc + c.interestedCount, 0);
  
  const avgOpenRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const avgReplyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;
  const pipelineValue = deals.reduce((acc, d) => acc + d.value, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  const actionButtons = [
    {
      id: 'campaign',
      label: 'Envoyer une Campagne',
      sublabel: `${activeCampaigns} actives`,
      href: '/campaigns/new',
      icon: Send,
      gradient: 'linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%)',
      iconBg: '#000000',
      iconColor: '#ffffff',
      textColor: '#000000',
      primary: true,
    },
    {
      id: 'contacts',
      label: 'Contacts & Leads',
      sublabel: `${leads.length} prospects`,
      href: '/leads',
      icon: Users,
      gradient: 'transparent',
      iconBg: 'rgba(255,255,255,0.06)',
      iconColor: '#ffffff',
      textColor: '#ffffff',
      primary: false,
    },
    {
      id: 'stats',
      label: 'Statistiques',
      sublabel: `${avgOpenRate}% ouverture`,
      href: '/analytics',
      icon: BarChart3,
      gradient: 'transparent',
      iconBg: 'rgba(255,255,255,0.06)',
      iconColor: '#ffffff',
      textColor: '#ffffff',
      primary: false,
    },
    {
      id: 'unibox',
      label: 'Unibox',
      sublabel: `${messages.filter(m => !m.read).length} non lus`,
      href: '/unibox',
      icon: Inbox,
      gradient: 'transparent',
      iconBg: 'rgba(255,255,255,0.06)',
      iconColor: '#ffffff',
      textColor: '#ffffff',
      primary: false,
    },
    {
      id: 'warmup',
      label: 'Délivrabilité',
      sublabel: `Score ${warmupConfig.currentScore}%`,
      href: '/warmup',
      icon: Flame,
      gradient: 'transparent',
      iconBg: 'rgba(255,255,255,0.06)',
      iconColor: '#ffffff',
      textColor: '#ffffff',
      primary: false,
    },
    {
      id: 'crm',
      label: 'Pipeline CRM',
      sublabel: `${deals.length} deals`,
      href: '/crm',
      icon: Target,
      gradient: 'transparent',
      iconBg: 'rgba(255,255,255,0.06)',
      iconColor: '#ffffff',
      textColor: '#ffffff',
      primary: false,
    },
  ];

  const kpiCards = [
    {
      label: 'Total Envoyés',
      value: totalSent.toLocaleString('fr-FR'),
      icon: Send,
      trend: '+18%',
      sub: 'cette semaine',
    },
    {
      label: "Taux d'Ouverture",
      value: `${avgOpenRate}%`,
      icon: MailOpen,
      trend: null,
      sub: 'Moy. secteur : 42%',
    },
    {
      label: 'Taux de Réponse',
      value: `${avgReplyRate}%`,
      icon: MessageSquare,
      trend: `+${totalReplied}`,
      sub: 'réponses totales',
    },
    {
      label: 'Pipeline CRM',
      value: `${pipelineValue.toLocaleString('fr-FR')} €`,
      icon: TrendingUp,
      trend: null,
      sub: `${deals.length} opportunités actives`,
    },
  ];

  return (
    <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start' }}>

      {/* ─── LEFT ACTION PANEL ─────────────────────────────── */}
      <div style={{
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'sticky',
        top: '24px',
      }}>
        {/* Panel Header */}
        <div style={{ marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Zap size={14} color="#ffffff" />
            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Actions Rapides
            </span>
          </div>
          <div style={{ height: '1px', background: 'var(--border-subtle)' }} />
        </div>

        {/* Action Buttons */}
        {actionButtons.map((btn) => {
          const Icon = btn.icon;
          const isHovered = activeAction === btn.id;

          return (
            <Link
              key={btn.id}
              href={btn.href}
              onMouseEnter={() => setActiveAction(btn.id)}
              onMouseLeave={() => setActiveAction(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: btn.primary ? '16px' : '13px 14px',
                borderRadius: 'var(--radius-md)',
                background: btn.primary
                  ? (isHovered ? '#e5e5e5' : '#ffffff')
                  : (isHovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)'),
                border: btn.primary
                  ? 'none'
                  : `1px solid ${isHovered ? 'rgba(255,255,255,0.22)' : 'var(--border-subtle)'}`,
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                transform: isHovered ? 'translateX(3px)' : 'none',
                boxShadow: btn.primary && isHovered ? '0 8px 24px rgba(255,255,255,0.18)' : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Icon box */}
              <div style={{
                width: btn.primary ? '40px' : '34px',
                height: btn.primary ? '40px' : '34px',
                borderRadius: btn.primary ? '10px' : '8px',
                background: btn.primary ? '#000000' : (isHovered ? 'rgba(255,255,255,0.12)' : btn.iconBg),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.18s ease',
              }}>
                <Icon
                  size={btn.primary ? 18 : 16}
                  color={btn.primary ? '#ffffff' : (isHovered ? '#ffffff' : '#a3a3a3')}
                />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: btn.primary ? '0.9rem' : '0.83rem',
                  fontWeight: btn.primary ? 700 : 600,
                  color: btn.primary ? '#000000' : (isHovered ? '#ffffff' : 'var(--text-muted)'),
                  letterSpacing: '-0.01em',
                  transition: 'color 0.18s ease',
                }}>
                  {btn.label}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  color: btn.primary ? 'rgba(0,0,0,0.55)' : 'var(--text-subtle)',
                  marginTop: '1px',
                }}>
                  {btn.sublabel}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={14}
                color={btn.primary ? 'rgba(0,0,0,0.4)' : (isHovered ? 'var(--text-muted)' : 'transparent')}
                style={{ transition: 'all 0.18s ease', flexShrink: 0 }}
              />
            </Link>
          );
        })}

        {/* Studio d'Images shortcut */}
        <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
          <Link
            href="/personalization"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px dashed rgba(255,255,255,0.15)',
              color: 'var(--text-subtle)',
              fontSize: '0.78rem',
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.35)';
              (e.currentTarget as HTMLElement).style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-subtle)';
            }}
          >
            <Sparkles size={14} />
            <span>Studio d&apos;Images IA</span>
          </Link>
        </div>
      </div>

      {/* ─── MAIN CONTENT ─────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>

        {/* Page Title */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <Activity size={16} color="var(--text-subtle)" />
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.03em' }}>
              Cockpit Multicanal
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem' }}>
            Supervision des flux · Cold Email · LinkedIn · SMPP · Score délivrabilité
          </p>
        </div>

        {/* ── KPI CARDS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          marginBottom: '24px',
        }}>
          {kpiCards.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="stat-card">
                <div className="stat-card-header">
                  <span>{kpi.label}</span>
                  <div className="stat-card-icon">
                    <Icon size={16} />
                  </div>
                </div>
                <div className="stat-value">{kpi.value}</div>
                <div className="stat-subtext">
                  {kpi.trend && (
                    <span style={{ color: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <ArrowUpRight size={12} />{kpi.trend}
                    </span>
                  )}
                  {' '}{kpi.sub}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CAMPAIGNS + DELIVERABILITY ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>

          {/* Campaigns */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Campagnes Multicanales</h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Séquences automatisées Email + LinkedIn</p>
              </div>
              <Link href="/campaigns" className="btn btn-secondary btn-sm">
                Voir tout ({campaigns.length})
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {campaigns.map((camp) => {
                const openRate = camp.sentCount > 0 ? Math.round((camp.openedCount / camp.sentCount) * 100) : 0;
                const replyRate = camp.sentCount > 0 ? Math.round((camp.repliedCount / camp.sentCount) * 100) : 0;

                return (
                  <div
                    key={camp.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: '#080808',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '14px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span className="badge">
                          {camp.status === 'active' ? (
                            <>
                              <span className="live-dot" style={{ width: '5px', height: '5px' }} />
                              Active
                            </>
                          ) : 'Pause'}
                        </span>
                        <h3 style={{ fontSize: '0.88rem', fontWeight: 600 }}>{camp.name}</h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                        <span>{camp.steps.length} étapes</span>
                        <span>•</span>
                        <span>{camp.leadsCount} prospects</span>
                        <span>•</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={11} /> {camp.scheduleStartTime} - {camp.scheduleEndTime}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '18px', textAlign: 'center' }}>
                      {[
                        { label: 'Envoyés', val: camp.sentCount },
                        { label: 'Ouverts', val: `${openRate}%` },
                        { label: 'Répondus', val: `${replyRate}%` },
                      ].map(({ label, val }) => (
                        <div key={label}>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>{label}</div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 700, fontFamily: 'Space Grotesk' }}>{val}</div>
                        </div>
                      ))}

                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button
                          onClick={() => toggleCampaignStatus(camp.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 7px' }}
                          title={camp.status === 'active' ? 'Mettre en pause' : 'Reprendre'}
                        >
                          {camp.status === 'active' ? <Pause size={12} /> : <Play size={12} fill="#ffffff" />}
                        </button>
                        <Link href={`/campaigns/${camp.id}`} className="btn btn-secondary btn-sm" style={{ padding: '5px 7px' }}>
                          <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deliverability */}
          <div className="card">
            <div className="card-header">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                  <Flame size={16} />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Délivrabilité</h2>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Lemwarm · SPF / DKIM / DMARC</p>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '16px 0 20px' }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                margin: '0 auto',
                background: `conic-gradient(#ffffff 0% ${warmupConfig.currentScore}%, rgba(255,255,255,0.1) ${warmupConfig.currentScore}% 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '92px',
                  height: '92px',
                  borderRadius: '50%',
                  background: '#0a0a0a',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <span style={{ fontSize: '1.65rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                    {warmupConfig.currentScore}
                  </span>
                  <span style={{ fontSize: '0.58rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Optimal</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
              {[
                { label: 'Boîte', val: warmupConfig.mailboxEmail },
                { label: 'Inbox Placement', val: `${warmupConfig.inboxPlacementRate}%` },
                { label: 'Protocoles DNS', val: 'Validés ✓' },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 10px', background: '#050505', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>

            <Link href="/warmup" className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
              Gérer la Chauffe & DNS
            </Link>
          </div>
        </div>

        {/* ── UNIBOX + DEALS ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

          {/* Unibox */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Dernières Réponses</h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Unibox · détection de sentiment</p>
              </div>
              <Link href="/unibox" className="btn btn-secondary btn-sm">Ouvrir</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {messages.slice(0, 3).map((msg) => (
                <div key={msg.id} style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: '#080808',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  gap: '10px',
                }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '4px',
                    background: '#000000', border: '1px solid var(--border-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {msg.channel === 'linkedin' ? <Linkedin size={14} /> : <Mail size={14} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{msg.leadName} · {msg.leadCompany}</div>
                      <span className="badge">{msg.sentiment === 'meeting_booked' ? 'Rdv' : 'Intéressé'}</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {msg.snippet}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deals */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Deals en Cours</h2>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Opportunités commerciales actives</p>
              </div>
              <Link href="/crm" className="btn btn-secondary btn-sm">Kanban</Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {deals.slice(0, 3).map((deal) => (
                <div key={deal.id} style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: '#080808',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '3px' }}>{deal.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>
                      {deal.leadName} · {deal.expectedCloseDate}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                      {deal.value.toLocaleString('fr-FR')} €
                    </div>
                    <span className="badge" style={{ fontSize: '0.62rem' }}>
                      {deal.stage === 'demo_booked' ? 'Démo planifiée' : deal.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
