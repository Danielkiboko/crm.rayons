'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Mail, 
  Linkedin, 
  Clock, 
  Sparkles, 
  Trash2, 
  Eye, 
  Check, 
  Shuffle, 
  Send,
  HelpCircle,
  Layers,
  ChevronDown,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { CampaignStep, ChannelType, StepActionType } from '@/types';

export default function NewCampaignPage() {
  const router = useRouter();
  const { createCampaign, imageTemplates, leads } = useCrm();

  // Campaign General Settings
  const [name, setName] = useState('Outreach Décideurs - Q4');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dailyLimit, setDailyLimit] = useState(40);
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('18:00');

  // Steps
  const [steps, setSteps] = useState<CampaignStep[]>([
    {
      id: 'step-new-1',
      order: 1,
      type: 'linkedin_visit',
      channel: 'linkedin',
      title: 'Visite automatique du profil LinkedIn',
      delayDays: 0,
      delayHours: 0
    },
    {
      id: 'step-new-2',
      order: 2,
      type: 'email_send',
      channel: 'email',
      title: 'Email d\'accroche avec image personnalisée',
      delayDays: 1,
      delayHours: 2,
      subject: 'Question stratégique pour {{firstName}} chez {{company}} ☕',
      body: 'Bonjour {{firstName}},\n\nJe suis de très près les initiatives de {{company}} en tant que {{jobTitle}}.\n\nJ\'ai préparé une courte attention visuelle pour vous :\n\n{{personalizedImage}}\n\nSeriez-vous ouvert à échanger 5 minutes cette semaine ?\n\nBien à vous,\nAlexandre',
      personalizedImageUrl: 'coffee-mug',
      enableABTesting: true,
      subjectB: '{{company}} x Opportunité d\'accélération commerciale',
      bodyB: 'Bonjour {{firstName}},\n\nJe me permets de vous contacter car nous aidons les équipes de {{company}} à générer +35% de rendez-vous qualifiés.\n\nDiscutons-en rapidement,\nAlexandre'
    },
    {
      id: 'step-new-3',
      order: 3,
      type: 'linkedin_connect',
      channel: 'linkedin',
      title: 'Demande de connexion LinkedIn',
      delayDays: 2,
      delayHours: 0,
      linkedInNote: 'Bonjour {{firstName}}, je fais suite à mon email. Ravi de connecter avec l\'équipe dirigeante de {{company}} !'
    }
  ]);

  const [activeStepIndex, setActiveStepIndex] = useState(1);
  const [previewLeadIndex, setPreviewLeadIndex] = useState(0);
  const previewLead = leads[previewLeadIndex] || leads[0];

  // Adding steps
  const handleAddStep = (type: StepActionType) => {
    let newStep: CampaignStep;
    const nextOrder = steps.length + 1;

    if (type === 'email_send') {
      newStep = {
        id: `step-${Date.now()}`,
        order: nextOrder,
        type: 'email_send',
        channel: 'email',
        title: `Email étape ${nextOrder}`,
        delayDays: 3,
        delayHours: 0,
        subject: 'Re: Question stratégique pour {{firstName}}',
        body: 'Bonjour {{firstName}},\n\nAvez-vous eu le temps de consulter mon message précédent ?\n\nBien à vous,\nAlexandre'
      };
    } else if (type === 'linkedin_visit') {
      newStep = {
        id: `step-${Date.now()}`,
        order: nextOrder,
        type: 'linkedin_visit',
        channel: 'linkedin',
        title: 'Visite de profil LinkedIn',
        delayDays: 1,
        delayHours: 0
      };
    } else if (type === 'linkedin_connect') {
      newStep = {
        id: `step-${Date.now()}`,
        order: nextOrder,
        type: 'linkedin_connect',
        channel: 'linkedin',
        title: 'Invitation LinkedIn personnalisée',
        delayDays: 2,
        delayHours: 0,
        linkedInNote: 'Hello {{firstName}}, ravi d\'échanger avec l\'équipe de {{company}} !'
      };
    } else {
      newStep = {
        id: `step-${Date.now()}`,
        order: nextOrder,
        type: 'linkedin_message',
        channel: 'linkedin',
        title: 'Message privé LinkedIn',
        delayDays: 2,
        delayHours: 0,
        body: 'Hello {{firstName}}, je vous souhaite une excellente semaine !'
      };
    }

    setSteps([...steps, newStep]);
    setActiveStepIndex(steps.length);
  };

  const handleUpdateActiveStep = (updates: Partial<CampaignStep>) => {
    setSteps(prev => prev.map((s, idx) => idx === activeStepIndex ? { ...s, ...updates } : s));
  };

  const handleDeleteStep = (indexToDelete: number) => {
    if (steps.length <= 1) {
      alert('Une campagne doit comporter au moins une étape.');
      return;
    }
    const filtered = steps.filter((_, idx) => idx !== indexToDelete);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setSteps(reordered);
    setActiveStepIndex(Math.max(0, indexToDelete - 1));
  };

  // Variable helper insertion
  const insertVariable = (variable: string, targetField: 'subject' | 'body' | 'linkedInNote') => {
    const active = steps[activeStepIndex];
    if (!active) return;

    if (targetField === 'subject') {
      handleUpdateActiveStep({ subject: (active.subject || '') + ` {{${variable}}}` });
    } else if (targetField === 'body') {
      handleUpdateActiveStep({ body: (active.body || '') + ` {{${variable}}}` });
    } else if (targetField === 'linkedInNote') {
      handleUpdateActiveStep({ linkedInNote: (active.linkedInNote || '') + ` {{${variable}}}` });
    }
  };

  // Text interpolation for live preview
  const interpolateText = (text?: string) => {
    if (!text || !previewLead) return '';
    return text
      .replace(/{{firstName}}/g, previewLead.firstName)
      .replace(/{{lastName}}/g, previewLead.lastName)
      .replace(/{{company}}/g, previewLead.company)
      .replace(/{{jobTitle}}/g, previewLead.jobTitle)
      .replace(/{{email}}/g, previewLead.email);
  };

  const handleSubmit = (e?: React.FormEvent, campaignStatus: 'active' | 'draft' = 'active') => {
    if (e) e.preventDefault();
    setErrorNotice(null);

    const finalName = name.trim() || 'Outreach Décideurs - Q4';

    setIsSubmitting(true);
    try {
      createCampaign({
        name: finalName,
        status: campaignStatus,
        steps,
        leadsCount: leads.length,
        senderAccounts: ['alexandre.prospecting@company.io'],
        dailyLimit,
        timezone,
        scheduleDays: [1, 2, 3, 4, 5],
        scheduleStartTime,
        scheduleEndTime
      });

      router.push('/campaigns');
    } catch (err) {
      console.error(err);
      setErrorNotice('Une erreur inattendue est survenue lors de la création.');
      setIsSubmitting(false);
    }
  };

  const currentStep = steps[activeStepIndex];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/campaigns" className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
            Retour
          </Link>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
              Créer une Campagne Multicanale
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Configurez vos étapes Email, LinkedIn et votre générateur d'images personnalisées
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, 'draft')} 
            disabled={isSubmitting}
            className="btn btn-secondary"
          >
            Brouillon
          </button>
          <button 
            type="button" 
            onClick={(e) => handleSubmit(e, 'active')} 
            disabled={isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? (
              <>
                <RefreshCw size={15} className="spin" />
                Lancement...
              </>
            ) : (
              <>
                <Send size={15} />
                Lancer la Campagne
              </>
            )}
          </button>
        </div>
      </div>

      {errorNotice && (
        <div style={{ padding: '12px 16px', background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.85rem', marginBottom: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} color="#000000" />
          {errorNotice}
        </div>
      )}

      {/* Main Grid: Builder Left (Sequence & Form) | Preview Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.9fr', gap: '28px' }}>
        {/* Left Column: Form & Sequence Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* General info card */}
          <div className="card">
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                1. Paramètres Généraux & Plages Horaires
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '12px' }}>
              <div>
                <label className="label">Nom de la campagne</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="ex: Outreach SaaS - Directeurs Commerciaux Q4"
                  className="input"
                />
                {/* Name presets */}
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  {[
                    'Outreach SaaS Décideurs',
                    'Prospection Licornes & B2B',
                    'Relance Multicanale Q4'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setName(preset)}
                      className="badge badge-outline"
                      style={{ cursor: 'pointer', padding: '3px 8px', fontSize: '0.68rem' }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Quota max / jour</label>
                <input 
                  type="number" 
                  value={dailyLimit} 
                  onChange={(e) => setDailyLimit(Number(e.target.value))} 
                  className="input"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Fuseau horaire</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="select">
                  <option value="Europe/Paris">Europe/Paris (UTC+1)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="label">Début des envois</label>
                <input 
                  type="time" 
                  value={scheduleStartTime} 
                  onChange={(e) => setScheduleStartTime(e.target.value)} 
                  className="input"
                />
              </div>
              <div>
                <label className="label">Fin des envois</label>
                <input 
                  type="time" 
                  value={scheduleEndTime} 
                  onChange={(e) => setScheduleEndTime(e.target.value)} 
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* Sequence Steps Navigation & Builder */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Séquence Multicanale par Étapes</h2>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Glissez ou sélectionnez les étapes pour les éditer</p>
              </div>

              {/* Add Step Dropdown */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleAddStep('email_send')} className="btn btn-secondary btn-sm">
                  <Mail size={14} color="#fbbf24" /> + Email
                </button>
                <button onClick={() => handleAddStep('linkedin_visit')} className="btn btn-secondary btn-sm">
                  <Linkedin size={14} color="#38bdf8" /> + Visite
                </button>
                <button onClick={() => handleAddStep('linkedin_connect')} className="btn btn-secondary btn-sm">
                  <Linkedin size={14} color="#38bdf8" /> + Connexion
                </button>
              </div>
            </div>

            {/* Steps Timeline Tabs */}
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
              {steps.map((step, idx) => {
                const isSelected = idx === activeStepIndex;
                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setActiveStepIndex(idx)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary-gradient)' : 'rgba(255, 255, 255, 0.03)',
                      color: isSelected ? 'white' : 'var(--text-muted)',
                      border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'var(--transition)'
                    }}
                  >
                    {step.channel === 'linkedin' ? <Linkedin size={14} /> : <Mail size={14} />}
                    <span>Étape {step.order}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({step.delayDays}j)</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Editor */}
            {currentStep && (
              <div style={{ background: 'rgba(0, 0, 0, 0.2)', padding: '20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className={currentStep.channel === 'linkedin' ? 'badge badge-linkedin' : 'badge badge-email'}>
                      {currentStep.channel === 'linkedin' ? 'Action LinkedIn' : 'Email Cold Outreach'}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Étape {currentStep.order} : {currentStep.title}</h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <Clock size={14} /> Attendre :
                      <input 
                        type="number" 
                        min="0"
                        value={currentStep.delayDays} 
                        onChange={(e) => handleUpdateActiveStep({ delayDays: Number(e.target.value) })}
                        style={{ width: '50px', padding: '4px 6px', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: '4px', color: 'white' }}
                      /> jours
                    </div>
                    <button 
                      onClick={() => handleDeleteStep(activeStepIndex)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px' }}
                      title="Supprimer cette étape"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Variable insertion buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 600 }}>Variables :</span>
                  {['firstName', 'lastName', 'company', 'jobTitle', 'email'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v, currentStep.channel === 'linkedin' && currentStep.type === 'linkedin_connect' ? 'linkedInNote' : 'body')}
                      style={{
                        background: '#080808',
                        color: '#ffffff',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '2px',
                        padding: '3px 8px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        fontFamily: 'monospace'
                      }}
                    >
                      + {`{{${v}}}`}
                    </button>
                  ))}
                </div>

                {/* EMAIL STEP CONFIG */}
                {currentStep.channel === 'email' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label className="label">Objet de l'email</label>
                      <input 
                        type="text" 
                        value={currentStep.subject || ''} 
                        onChange={(e) => handleUpdateActiveStep({ subject: e.target.value })}
                        className="input"
                        placeholder="ex: Question stratégique pour {{firstName}} chez {{company}}"
                      />
                    </div>

                    {/* Lemlist Killer Feature: Image Personnalisée Selector - Starlink */}
                    <div style={{ 
                      background: '#080808',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px 16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <Sparkles size={15} />
                          Image Personnalisée Dynamique
                        </div>
                        <select 
                          value={currentStep.personalizedImageUrl || ''}
                          onChange={(e) => handleUpdateActiveStep({ personalizedImageUrl: e.target.value || undefined })}
                          className="select"
                          style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
                        >
                          <option value="">-- Aucune image --</option>
                          {imageTemplates.map((t) => (
                            <option key={t.id} value={t.id}>{t.title}</option>
                          ))}
                        </select>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Incruste automatiquement le prénom du prospect ou le logo de son entreprise sur l'image visuelle.
                      </p>
                    </div>

                    <div>
                      <label className="label">Corps du message (Cold Email)</label>
                      <textarea 
                        rows={7}
                        value={currentStep.body || ''} 
                        onChange={(e) => handleUpdateActiveStep({ body: e.target.value })}
                        className="textarea"
                      />
                    </div>

                    {/* A/B Testing Toggle */}
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 600, textTransform: 'uppercase' }}>
                          <Shuffle size={14} />
                          A/B Testing (Variation B)
                        </div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
                          <input 
                            type="checkbox"
                            checked={currentStep.enableABTesting || false}
                            onChange={(e) => handleUpdateActiveStep({ enableABTesting: e.target.checked })}
                          />
                          Activer le test A/B (50% / 50%)
                        </label>
                      </div>

                      {currentStep.enableABTesting && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                          <input 
                            type="text" 
                            placeholder="Objet Variation B" 
                            value={currentStep.subjectB || ''} 
                            onChange={(e) => handleUpdateActiveStep({ subjectB: e.target.value })}
                            className="input"
                          />
                          <textarea 
                            rows={4}
                            placeholder="Corps du texte Variation B" 
                            value={currentStep.bodyB || ''} 
                            onChange={(e) => handleUpdateActiveStep({ bodyB: e.target.value })}
                            className="textarea"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* LINKEDIN VISIT STEP CONFIG */}
                {currentStep.type === 'linkedin_visit' && (
                  <div style={{ padding: '16px', background: 'rgba(10, 102, 194, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(10, 102, 194, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <Linkedin size={20} color="#38bdf8" />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Visite discrète du profil</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Le système visitera automatiquement le profil LinkedIn de votre prospect. Cela déclenche une notification « Quelqu'un a consulté votre profil » et prépare le terrain pour le Cold Email.
                    </p>
                  </div>
                )}

                {/* LINKEDIN CONNECT STEP CONFIG */}
                {currentStep.type === 'linkedin_connect' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label className="label">Note d'invitation personnalisée (Max 300 caractères)</label>
                    <textarea 
                      rows={4}
                      value={currentStep.linkedInNote || ''} 
                      onChange={(e) => handleUpdateActiveStep({ linkedInNote: e.target.value })}
                      className="textarea"
                      placeholder="Bonjour {{firstName}}, je fais suite à mon email..."
                    />
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', textAlign: 'right' }}>
                      {(currentStep.linkedInNote || '').length} / 300 caractères
                    </div>
                  </div>
                )}

                {/* LINKEDIN MESSAGE STEP CONFIG */}
                {currentStep.type === 'linkedin_message' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <label className="label">Message privé LinkedIn (envoyé une fois connecté)</label>
                    <textarea 
                      rows={5}
                      value={currentStep.body || ''} 
                      onChange={(e) => handleUpdateActiveStep({ body: e.target.value })}
                      className="textarea"
                      placeholder="Hello {{firstName}}, ravi d'échanger !"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Launch Card */}
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '2px' }}>
                Prêt pour le déploiement
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Campagne configurée avec {steps.length} étapes pour {leads.length} prospect(s)
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={(e) => handleSubmit(e, 'draft')} 
                disabled={isSubmitting}
                className="btn btn-secondary"
              >
                Brouillon
              </button>
              <button 
                type="button" 
                onClick={(e) => handleSubmit(e, 'active')} 
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    Lancement...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Lancer la Campagne
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Dynamic Preview with Selected Prospect */}
        <div>
          <div className="card" style={{ position: 'sticky', top: '90px' }}>
            <div className="card-header" style={{ marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={18} color="#818cf8" />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Aperçu Dynamique en Direct</h2>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rendu réel avec les variables du prospect</p>
              </div>

              {/* Lead Switcher */}
              <select 
                value={previewLeadIndex} 
                onChange={(e) => setPreviewLeadIndex(Number(e.target.value))}
                className="select"
                style={{ width: 'auto', padding: '4px 10px', fontSize: '0.75rem' }}
              >
                {leads.map((l, i) => (
                  <option key={l.id} value={i}>{l.firstName} {l.lastName} ({l.company})</option>
                ))}
              </select>
            </div>

            {/* Preview Box - Starlink */}
            <div style={{
              background: '#050505',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              padding: '20px'
            }}>
              {/* Prospect header bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '4px',
                  background: '#000000',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: '#ffffff'
                }}>
                  {previewLead ? `${previewLead.firstName[0]}${previewLead.lastName[0] || ''}` : 'P'}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                    {previewLead?.firstName} {previewLead?.lastName}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {previewLead?.jobTitle} • {previewLead?.company} ({previewLead?.email})
                  </div>
                </div>
              </div>

              {/* RENDER CURRENT STEP */}
              {currentStep?.channel === 'email' ? (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '4px' }}>Objet :</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px' }}>
                    {interpolateText(currentStep.subject) || 'Sans objet'}
                  </div>

                  {/* Dynamic Mockup Image Preview if active */}
                  {currentStep.personalizedImageUrl && (
                    <div style={{
                      position: 'relative',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      marginBottom: '16px',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <img 
                        src={imageTemplates.find(t => t.id === currentStep.personalizedImageUrl)?.thumbnailUrl || ''} 
                        alt="Aperçu personnalisé"
                        style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                      />
                      {/* Dynamic Overlaid Badge / Starlink effect */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: '#000000',
                        padding: '12px 20px',
                        borderRadius: '4px',
                        border: '1px solid #ffffff',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          Spécialement pour
                        </div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>
                          {previewLead?.firstName} @ {previewLead?.company}
                        </div>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.86rem', lineHeight: '1.6', color: '#e5e5e5', whiteSpace: 'pre-line' }}>
                    {interpolateText(currentStep.body)}
                  </div>
                </div>
              ) : (
                /* LinkedIn Message / Invite Preview */
                <div style={{ background: '#080808', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#ffffff', fontSize: '0.78rem', fontWeight: 600, textTransform: 'uppercase' }}>
                    <Linkedin size={14} /> Aperçu Invitation LinkedIn :
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: '1.5', color: '#e5e5e5', whiteSpace: 'pre-line' }}>
                    {interpolateText(currentStep?.linkedInNote || currentStep?.body || 'Visite discrète de profil.')}
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              💡 <strong>Astuce Lemlist</strong> : Les séquences combinant au moins une visite LinkedIn et un email personnalisé génèrent <strong>3,4x plus de réponses</strong> que les emails froids génériques.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
