'use client';

import React, { useState } from 'react';
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
  BarChart2,
  RefreshCw,
  CheckCircle2,
  X,
  Server
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { Campaign } from '@/types';

export default function CampaignsPage() {
  const { 
    campaigns, 
    toggleCampaignStatus, 
    deleteCampaign, 
    simulateCampaignSend,
    emailAccounts,
    leads,
    sendBulkCampaignLive 
  } = useCrm();

  const [liveSendModalCamp, setLiveSendModalCamp] = useState<Campaign | null>(null);
  const [isSendingLive, setIsSendingLive] = useState(false);
  const [sendProgress, setSendProgress] = useState<{ current: number; total: number } | null>(null);
  const [sendResult, setSendResult] = useState<{ sent: number; failed: number } | null>(null);

  const defaultAccount = emailAccounts.find(a => a.isDefault) || emailAccounts[0];

  const handleStartLiveSend = async () => {
    if (!liveSendModalCamp) return;
    setIsSendingLive(true);
    setSendResult(null);

    const res = await sendBulkCampaignLive(liveSendModalCamp.id, (current, total) => {
      setSendProgress({ current, total });
    });

    setSendResult(res);
    setIsSendingLive(false);
  };

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
                    onClick={() => {
                      setLiveSendModalCamp(camp);
                      setSendResult(null);
                      setSendProgress(null);
                    }}
                    className="btn btn-sm"
                    style={{ background: '#ffffff', color: '#000000', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                    title="Envoyer réellement aux contacts avec votre adresse professionnelle"
                  >
                    <Send size={13} />
                    Envoyer en Réel (SMTP)
                  </button>

                  <button 
                    onClick={() => simulateCampaignSend(camp.id)}
                    className="btn btn-secondary btn-sm"
                    title="Simuler un envoi immédiat et générer des réponses"
                  >
                    <Play size={14} color="#f59e0b" fill="#f59e0b" />
                    Simulation
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

      {/* LIVE SEND MODAL */}
      {liveSendModalCamp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Send size={20} color="#ffffff" />
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Lancer l'Envoi Réel par E-mail</h2>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Campagne : {liveSendModalCamp.name}</div>
                </div>
              </div>
              <button 
                onClick={() => setLiveSendModalCamp(null)} 
                disabled={isSendingLive}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Account Sender Info */}
            <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Compte E-mail d'expédition :</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} />
                  <span style={{ fontWeight: 600 }}>{defaultAccount ? defaultAccount.email : 'danielkiboko218@gmail.com'}</span>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>SMTP ACTIF</span>
                </div>
                <Link href="/settings/email" style={{ fontSize: '0.75rem', color: '#ffffff', textDecoration: 'underline' }}>
                  Changer
                </Link>
              </div>
            </div>

            {/* Target Contacts Info */}
            <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Destinataires cibles de la campagne</span>
                <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  {leads.filter(l => l.email).length} contacts valides
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Chaque email sera automatiquement personnalisé avec les variables : <code>{'{{firstName}}'}</code>, <code>{'{{company}}'}</code>, <code>{'{{jobTitle}}'}</code>.
              </div>
            </div>

            {/* Sending Progress Bar */}
            {isSendingLive && (
              <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', border: '1px solid #ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={14} className="spin" /> Envoi en cours via SMTP...
                  </span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, fontFamily: 'monospace' }}>
                    {sendProgress ? `${sendProgress.current} / ${sendProgress.total}` : 'Initialisation...'}
                  </span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: sendProgress ? `${Math.round((sendProgress.current / sendProgress.total) * 100)}%` : '10%', 
                    height: '100%', 
                    background: '#ffffff',
                    transition: 'width 0.3s ease' 
                  }} />
                </div>
              </div>
            )}

            {/* Sending Finished Success Result */}
            {sendResult && (
              <div style={{
                padding: '14px 16px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: 'var(--radius-md)',
                color: '#34d399',
                fontSize: '0.85rem',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <CheckCircle2 size={18} />
                <span>
                  Campagne envoyée avec succès ! <strong>{sendResult.sent} emails délivrés</strong> via votre compte SMTP. Les réponses apparaîtront dans l'Unibox.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => setLiveSendModalCamp(null)} 
                disabled={isSendingLive}
                className="btn btn-secondary"
              >
                {sendResult ? 'Fermer' : 'Annuler'}
              </button>
              {!sendResult && (
                <button 
                  onClick={handleStartLiveSend} 
                  disabled={isSendingLive}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Send size={15} />
                  {isSendingLive ? 'Envoi en direct...' : 'Lancer l\'Envoi Maintenant'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
