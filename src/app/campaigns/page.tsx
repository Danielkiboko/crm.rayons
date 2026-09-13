'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Send, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Users, 
  Clock, 
  Linkedin, 
  Mail, 
  Sparkles, 
  Layers, 
  ChevronRight,
  BarChart2
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function CampaignsPage() {
  const { campaigns, toggleCampaignStatus, deleteCampaign, simulateCampaignSend } = useCrm();

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>
            Campagnes Multicanales
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Combinez Cold Email, Visites de profil LinkedIn, Invitations et Messages vocaux dans un flux automatisé.
          </p>
        </div>

        <Link href="/campaigns/new" className="btn btn-primary">
          <Plus size={16} />
          Créer une Campagne
        </Link>
      </div>

      {/* Campaigns List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {campaigns.map((camp) => {
          const openRate = camp.sentCount > 0 ? Math.round((camp.openedCount / camp.sentCount) * 100) : 0;
          const clickRate = camp.sentCount > 0 ? Math.round((camp.clickedCount / camp.sentCount) * 100) : 0;
          const replyRate = camp.sentCount > 0 ? Math.round((camp.repliedCount / camp.sentCount) * 100) : 0;
          const interestRate = camp.repliedCount > 0 ? Math.round((camp.interestedCount / camp.repliedCount) * 100) : 0;

          return (
            <div key={camp.id} className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span className={camp.status === 'active' ? 'badge badge-success' : 'badge badge-warning'}>
                      {camp.status === 'active' ? (
                        <>
                          <span className="live-dot" style={{ width: '6px', height: '6px' }}></span>
                          Active
                        </>
                      ) : 'En pause'}
                    </span>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{camp.name}</h2>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} /> {camp.leadsCount} prospects engagés
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Layers size={14} /> {camp.steps.length} étapes multicanales
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> Lun-Ven ({camp.scheduleStartTime} - {camp.scheduleEndTime})
                    </span>
                  </div>
                </div>

                {/* Top Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button 
                    onClick={() => simulateCampaignSend(camp.id)}
                    className="btn btn-secondary btn-sm"
                    title="Simuler un envoi immédiat et générer des réponses"
                  >
                    <Play size={14} color="#f59e0b" fill="#f59e0b" />
                    Tester l'envoi
                  </button>

                  <button 
                    onClick={() => toggleCampaignStatus(camp.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    {camp.status === 'active' ? <Pause size={14} /> : <Play size={14} color="#10b981" />}
                    {camp.status === 'active' ? 'Mettre en pause' : 'Démarrer'}
                  </button>

                  <Link href={`/campaigns/${camp.id}`} className="btn btn-primary btn-sm">
                    Gérer la séquence
                    <ChevronRight size={14} />
                  </Link>

                  <button 
                    onClick={() => {
                      if (confirm('Voulez-vous supprimer cette campagne ?')) {
                        deleteCampaign(camp.id);
                      }
                    }}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '8px' }}
                    title="Supprimer la campagne"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Steps Flow Timeline Preview */}
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.25)', 
                padding: '14px 18px', 
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                overflowX: 'auto',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Flux :
                </span>
                {camp.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#080808',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.78rem',
                      whiteSpace: 'nowrap'
                    }}>
                      {step.channel === 'linkedin' ? <Linkedin size={13} color="#ffffff" /> : <Mail size={13} color="#ffffff" />}
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>{step.order}. {step.title.split(':')[1] || step.title}</span>
                      {step.personalizedImageUrl && (
                        <span title="Image personnalisée active"><Sparkles size={12} color="#ffffff" /></span>
                      )}
                    </div>
                    {idx < camp.steps.length - 1 && (
                      <span style={{ color: 'var(--text-subtle)', fontSize: '0.8rem' }}>→</span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Performance Metrics Bar - Starlink Style */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '16px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Envoyés</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Space Grotesk' }}>{camp.sentCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Quota : {camp.dailyLimit}/j</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Taux d'ouverture</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Space Grotesk' }}>{openRate}%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{camp.openedCount} ouverts</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Taux de clics</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Space Grotesk' }}>{clickRate}%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{camp.clickedCount} clics</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Taux de réponse</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Space Grotesk' }}>{replyRate}%</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{camp.repliedCount} réponses</div>
                </div>

                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Intérêt qualifié</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', fontFamily: 'Space Grotesk' }}>{camp.interestedCount}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{interestRate}% des réponses</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
