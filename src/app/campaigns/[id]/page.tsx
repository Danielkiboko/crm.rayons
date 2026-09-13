'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Send, 
  MailOpen, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Linkedin, 
  Mail, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  const { campaigns, leads, toggleCampaignStatus, simulateCampaignSend, deleteCampaign } = useCrm();

  const campaign = campaigns.find(c => c.id === campaignId);
  const [activeTab, setActiveTab] = useState<'flow' | 'leads' | 'stats'>('flow');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!campaign) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Campagne introuvable</h2>
        <Link href="/campaigns" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Retour aux campagnes
        </Link>
      </div>
    );
  }

  const campaignLeads = leads.filter(l => l.campaignId === campaign.id);

  const handleSimulate = () => {
    simulateCampaignSend(campaign.id);
    setToastMessage('Batch d\'envoi simulé avec succès ! Métriques mises à jour.');
    setTimeout(() => setToastMessage(null), 4000);
  };

  const openRate = campaign.sentCount > 0 ? Math.round((campaign.openedCount / campaign.sentCount) * 100) : 0;
  const clickRate = campaign.sentCount > 0 ? Math.round((campaign.clickedCount / campaign.sentCount) * 100) : 0;
  const replyRate = campaign.sentCount > 0 ? Math.round((campaign.repliedCount / campaign.sentCount) * 100) : 0;

  return (
    <div>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: 'white',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/campaigns" className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
            Retour
          </Link>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h1 style={{ fontSize: '1.7rem', fontWeight: 800 }}>{campaign.name}</h1>
              <span className="badge">
                {campaign.status === 'active' ? 'En cours' : 'En pause'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')} • {campaign.senderAccounts.join(', ')}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleSimulate} className="btn btn-secondary btn-sm">
            <Play size={13} fill="#ffffff" />
            Simuler un Batch
          </button>
          <button onClick={() => toggleCampaignStatus(campaign.id)} className="btn btn-secondary btn-sm">
            {campaign.status === 'active' ? <Pause size={13} /> : <Play size={13} fill="#ffffff" />}
            {campaign.status === 'active' ? 'Pause' : 'Reprendre'}
          </button>
          <button 
            onClick={() => {
              if (confirm('Supprimer cette campagne ?')) {
                deleteCampaign(campaign.id);
                router.push('/campaigns');
              }
            }} 
            className="btn btn-danger btn-sm"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Metrics Row - Starlink Style */}
      <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span>Envoyés</span>
            <Send size={15} />
          </div>
          <div className="stat-value">{campaign.sentCount}</div>
          <div className="stat-subtext">Quota : {campaign.dailyLimit}/jour</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Taux d'ouverture</span>
            <MailOpen size={15} />
          </div>
          <div className="stat-value">{openRate}%</div>
          <div className="stat-subtext">{campaign.openedCount} ouverts</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Taux de clics</span>
            <TrendingUp size={15} />
          </div>
          <div className="stat-value">{clickRate}%</div>
          <div className="stat-subtext">{campaign.clickedCount} clics</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Taux de réponse</span>
            <MessageSquare size={15} />
          </div>
          <div className="stat-value">{replyRate}%</div>
          <div className="stat-subtext">{campaign.repliedCount} réponses</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span>Intérêt commercial</span>
            <Sparkles size={15} />
          </div>
          <div className="stat-value">{campaign.interestedCount}</div>
          <div className="stat-subtext">Prospects chauds</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('flow')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'flow' ? '2px solid #ffffff' : '2px solid transparent',
            color: activeTab === 'flow' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}
        >
          Séquence Visuelle ({campaign.steps.length} étapes)
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          style={{
            padding: '10px 18px',
            background: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'leads' ? '2px solid #ffffff' : '2px solid transparent',
            color: activeTab === 'leads' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.82rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            cursor: 'pointer'
          }}
        >
          Prospects Engagés ({campaignLeads.length})
        </button>
      </div>

      {/* TAB 1: VISUAL FLOWCHART - Starlink Style */}
      {activeTab === 'flow' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {campaign.steps.map((step, index) => (
            <div 
              key={step.id} 
              className="card"
              style={{
                position: 'relative',
                borderLeft: '2px solid #ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: '#000000',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff'
                  }}>
                    {step.channel === 'linkedin' ? <Linkedin size={16} /> : <Mail size={16} />}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
                      Étape {step.order} : {step.title}
                    </h3>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                      Délai : {step.delayDays === 0 && step.delayHours === 0 ? 'Immédiat au lancement' : `Attendre ${step.delayDays} jour(s)`}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {step.personalizedImageUrl && (
                    <span className="badge" style={{ padding: '3px 8px' }}>
                      <Sparkles size={11} /> Image Personnalisée
                    </span>
                  )}
                  {step.enableABTesting && (
                    <span className="badge" style={{ padding: '3px 8px' }}>
                      A/B Testing
                    </span>
                  )}
                </div>
              </div>

              {/* Step Content Preview */}
              <div style={{
                background: '#050505',
                border: '1px solid var(--border-subtle)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                color: 'var(--text-muted)'
              }}>
                {step.subject && (
                  <div style={{ fontWeight: 600, color: 'white', marginBottom: '6px' }}>
                    Objet : {step.subject}
                  </div>
                )}
                <div style={{ whiteSpace: 'pre-line', lineHeight: '1.5' }}>
                  {step.body || step.linkedInNote || 'Visite automatique et silencieuse du profil LinkedIn pour attirer l\'attention.'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: PROSPECTS LIST */}
      {activeTab === 'leads' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Prospect</th>
                <th>Entreprise</th>
                <th>Poste</th>
                <th>Statut</th>
                <th>Étape Actuelle</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {campaignLeads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.firstName} {l.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{l.email}</div>
                  </td>
                  <td>{l.company}</td>
                  <td>{l.jobTitle}</td>
                  <td>
                    <span className={l.status === 'replied' ? 'badge badge-success' : 'badge badge-primary'}>
                      {l.status === 'replied' ? 'A répondu' : l.status}
                    </span>
                  </td>
                  <td>Étape {l.currentStepIndex || 1} / {campaign.steps.length}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#34d399' }}>{l.score} / 100</span>
                  </td>
                </tr>
              ))}
              {campaignLeads.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    Tous les prospects de votre base sont prêts à être synchronisés avec cette campagne.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
