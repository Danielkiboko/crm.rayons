'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Mail, Linkedin, Clock, Sparkles, Trash2,
  Eye, Shuffle, Send, Layers, RefreshCw, AlertCircle,
  ChevronRight, Smartphone, MessageSquare, CheckCircle2,
  ChevronDown, UserCheck, Zap, Play, X, Check, Edit3, Lock
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { useAuth } from '@/context/AuthContext';
import { CampaignStep, ChannelType, StepActionType } from '@/types';
import { getSaasPricing, DEFAULT_SAAS_PRICING } from '@/lib/userStore';
import { cleanSmsText, analyzeSmsText } from '@/lib/smsUtils';

// ── Channel / Action definitions ─────────────────────────────────────
const CHANNELS = [
  { key: 'email',    label: 'Email',     icon: Mail,          color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { key: 'linkedin', label: 'LinkedIn',  icon: Linkedin,      color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  { key: 'sms',      label: 'SMS Direct',icon: Smartphone,    color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  { key: 'rcs',      label: 'RCS',       icon: MessageSquare, color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  { key: 'delay',    label: 'Délai',     icon: Clock,         color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  { key: 'task',     label: 'Tâche',     icon: CheckCircle2,  color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
] as const;

type ChannelKey = typeof CHANNELS[number]['key'];

const ACTIONS_BY_CHANNEL: Record<string, { key: StepActionType; label: string; sub: string }[]> = {
  email:    [{ key: 'email_send', label: 'Envoyer un Email', sub: 'Cold email personnalisé avec image dynamique & A/B' }],
  linkedin: [
    { key: 'linkedin_visit',   label: 'Visite de profil',      sub: 'Visite discrète pour déclencher la notification "Vue"' },
    { key: 'linkedin_connect', label: 'Invitation personnalisée', sub: 'Demande de connexion avec note (max 300 car.)' },
    { key: 'linkedin_message', label: 'Message privé',          sub: 'Message post-connexion ou InMail' },
    { key: 'linkedin_voice',   label: 'Note vocale',            sub: 'Message vocal via LinkedIn (Mobile)' },
  ],
  sms:      [{ key: 'sms_send', label: 'Envoyer SMS Direct', sub: 'SMS opérateur via route SMSC configurée' }],
  rcs:      [{ key: 'rcs_send', label: 'Envoyer carte RCS',  sub: 'Carte riche Google RBM avec boutons interactifs' }],
  delay:    [{ key: 'delay',    label: 'Pause d\'attente',    sub: 'Délai fixe avant l\'étape suivante' }],
  task:     [{ key: 'condition',label: 'Tâche manuelle',      sub: 'Rappel ou tâche assignée à un agent commercial' }],
};

// ── Channel icon helper ───────────────────────────────────────────────
function ChannelBadge({ channel, size = 16 }: { channel: ChannelKey | string; size?: number }) {
  const ch = CHANNELS.find(c => c.key === channel);
  if (!ch) return null;
  const Icon = ch.icon;
  return (
    <div style={{ width: size + 14, height: size + 14, borderRadius: '6px', background: ch.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon size={size} color={ch.color} />
    </div>
  );
}

// ── Step action label ────────────────────────────────────────────────
function actionLabel(type: StepActionType): string {
  for (const actions of Object.values(ACTIONS_BY_CHANNEL)) {
    const found = actions.find(a => a.key === type);
    if (found) return found.label;
  }
  return type;
}

// ── Text interpolation ───────────────────────────────────────────────
function interpolate(text: string, lead: any): string {
  if (!text || !lead) return '';
  return text
    .replace(/{{firstName}}/g, lead.firstName || '')
    .replace(/{{lastName}}/g, lead.lastName || '')
    .replace(/{{company}}/g, lead.company || '')
    .replace(/{{jobTitle}}/g, lead.jobTitle || '')
    .replace(/{{email}}/g, lead.email || '')
    .replace(/{{icebreaker}}/g, lead.icebreaker || '[Icebreaker IA]');
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function NewCampaignPage() {
  const router = useRouter();
  const { createCampaign, imageTemplates, leads, emailAccounts } = useCrm();
  const { user, trialStatus } = useAuth();

  // SaaS Pricing & Upgrades Gating
  const isSuperAdmin = trialStatus.isSuperAdmin || user?.role === 'superadmin';
  const [pricing, setPricing] = useState(DEFAULT_SAAS_PRICING);
  const [upgradeBlockedChannel, setUpgradeBlockedChannel] = useState<'sms' | 'rcs' | 'linkedin' | null>(null);

  React.useEffect(() => {
    setPricing(getSaasPricing());
  }, []);

  const hasUpgradeFor = (channel: string): boolean => {
    if (isSuperAdmin) return true;
    if (channel === 'email' || channel === 'delay' || channel === 'task') return true;
    if (channel === 'sms') return !!user?.hasSmsUpgrade && (user?.smppCredits ?? 0) > 0;
    if (channel === 'rcs') return !!user?.hasRcsUpgrade && (user?.rcsCredits ?? 0) > 0;
    if (channel === 'linkedin') return !!user?.hasLinkedinUpgrade;
    return false;
  };

  // General settings
  const [name, setName] = useState('Outreach Décideurs - Q4');
  const [dailyLimit, setDailyLimit] = useState(40);
  const [timezone, setTimezone] = useState('Africa/Kinshasa');
  const [scheduleStart, setScheduleStart] = useState('08:30');
  const [scheduleEnd, setScheduleEnd] = useState('18:00');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Pool d'expéditeurs rotatifs ──────────────────────────────
  const [senderPool, setSenderPool] = useState<string[]>(
    emailAccounts.length > 0 ? [emailAccounts[0].id] : []
  );
  const [senderPickerOpen, setSenderPickerOpen] = useState(false);

  const addSenderToPool = (accountId: string) => {
    if (!accountId || senderPool.includes(accountId)) return;
    setSenderPool(prev => [...prev, accountId]);
  };

  const removeSenderFromPool = (accountId: string) => {
    setSenderPool(prev => prev.filter(id => id !== accountId));
  };

  // Emails par compte = daily limit total / nb de comptes (arrondi)
  const quotaPerSender = senderPool.length > 0 ? Math.ceil(dailyLimit / senderPool.length) : dailyLimit;

  // Journey steps
  const [steps, setSteps] = useState<CampaignStep[]>([
    {
      id: 'step-1',
      order: 1,
      type: 'email_send',
      channel: 'email',
      title: 'Email d\'accroche personnalisé',
      delayDays: 0,
      delayHours: 0,
      subject: 'Question stratégique pour {{firstName}} chez {{company}} ☕',
      body: 'Bonjour {{firstName}},\n\nJe suis de très près les initiatives de {{company}} et je souhaitais partager quelque chose avec vous.\n\n{{icebreaker}}\n\nSeriez-vous disponible pour un échange de 5 minutes cette semaine ?\n\nCordialement,\nDaniel',
      personalizedImageUrl: 'coffee-mug',
    },
    {
      id: 'step-2',
      order: 2,
      type: 'linkedin_visit',
      channel: 'linkedin',
      title: 'Visite du profil LinkedIn',
      delayDays: 2,
      delayHours: 0,
    },
    {
      id: 'step-3',
      order: 3,
      type: 'linkedin_connect',
      channel: 'linkedin',
      title: 'Invitation LinkedIn personnalisée',
      delayDays: 3,
      delayHours: 0,
      linkedInNote: 'Bonjour {{firstName}}, ravi d\'échanger avec l\'équipe dirigeante de {{company}} !'
    }
  ]);

  // Step sender account mapping (stepId → emailAccountId)
  const [stepAccounts, setStepAccounts] = useState<Record<string, string>>({
    'step-1': emailAccounts[0]?.id || '',
  });

  // Active editor
  const [activeStepId, setActiveStepId] = useState<string | null>('step-1');
  const [previewLeadIdx, setPreviewLeadIdx] = useState(0);

  // Step picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerChannel, setPickerChannel] = useState<ChannelKey | null>(null);
  const [pickerAction, setPickerAction] = useState<StepActionType | null>(null);
  const [pickerAccount, setPickerAccount] = useState(emailAccounts[0]?.id || '');
  const [pickerDelay, setPickerDelay] = useState(3);

  const previewLead = leads[previewLeadIdx];
  const activeStep = steps.find(s => s.id === activeStepId) || null;

  // ── Step CRUD ───────────────────────────────────────────────────
  const updateStep = (id: string, updates: Partial<CampaignStep>) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

  const deleteStep = (id: string) => {
    if (steps.length <= 1) return alert('La campagne doit avoir au moins une étape.');
    const filtered = steps.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i + 1 }));
    setSteps(filtered);
    if (activeStepId === id) setActiveStepId(filtered[0]?.id || null);
  };

  const confirmAddStep = () => {
    if (!pickerChannel || !pickerAction) return;
    if (!hasUpgradeFor(pickerChannel)) {
      setUpgradeBlockedChannel(pickerChannel as any);
      return;
    }
    const ch = CHANNELS.find(c => c.key === pickerChannel);
    const actionDef = ACTIONS_BY_CHANNEL[pickerChannel]?.find(a => a.key === pickerAction);
    const newId = `step-${Date.now()}`;
    const newStep: CampaignStep = {
      id: newId,
      order: steps.length + 1,
      type: pickerAction,
      channel: pickerChannel as ChannelType,
      title: actionDef?.label || 'Nouvelle étape',
      delayDays: pickerDelay,
      delayHours: 0,
      subject: pickerChannel === 'email' ? 'Relance {{firstName}}' : undefined,
      body: pickerChannel === 'email' ? 'Bonjour {{firstName}},\n\nJe me permets de revenir vers vous.\n\nCordialement,\nDaniel' :
            pickerChannel === 'sms' ? 'Bonjour {{firstName}}, je vous recontacte. Répondez STOP pour vous désabonner.' :
            pickerChannel === 'rcs' ? 'Message RCS {{firstName}}' : undefined,
      linkedInNote: pickerChannel === 'linkedin' && pickerAction === 'linkedin_connect'
        ? 'Bonjour {{firstName}}, je fais suite à mon email récent !'
        : undefined,
    };
    setSteps(prev => [...prev, newStep]);
    if (pickerChannel === 'email') {
      setStepAccounts(prev => ({ ...prev, [newId]: pickerAccount }));
    }
    setActiveStepId(newId);
    setShowPicker(false);
    setPickerChannel(null);
    setPickerAction(null);
  };

  // ── Submit ───────────────────────────────────────────────────────
  const handleSubmit = (status: 'active' | 'draft') => {
    setErrorNotice(null);
    const blockedStep = steps.find(s => !hasUpgradeFor(s.channel));
    if (blockedStep) {
      const chObj = CHANNELS.find(c => c.key === blockedStep.channel);
      const chLabel = chObj?.label || blockedStep.channel;
      setErrorNotice(`Action bloquée : Votre campagne contient une étape "${blockedStep.title}" (${chLabel}) non incluse dans votre forfait de base Email Marketing. Veuillez activer l'upgrade correspondant pour continuer.`);
      setUpgradeBlockedChannel(blockedStep.channel as any);
      return;
    }
    setIsSubmitting(true);
    try {
      createCampaign({
        name: name.trim() || 'Campagne sans titre',
        status,
        steps,
        leadsCount: leads.length,
        senderAccounts: senderPool.map(id => emailAccounts.find(a => a.id === id)?.email || id),
        dailyLimit,
        timezone,
        scheduleDays: [1, 2, 3, 4, 5],
        scheduleStartTime: scheduleStart,
        scheduleEndTime: scheduleEnd,
        sentCount: 0, openedCount: 0, clickedCount: 0, repliedCount: 0,
        interestedCount: 0, bounceCount: 0,
      } as any);
      router.push('/campaigns');
    } catch (e: any) {
      setErrorNotice(e.message || 'Erreur inattendue.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

      {/* ── Top Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/campaigns" className="btn btn-secondary" style={{ padding: '8px 12px' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 800 }}>Créer un Parcours Client Multicanal</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Glissez les étapes, choisissez le canal, le compte expéditeur et la temporisation
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => handleSubmit('draft')} disabled={isSubmitting} className="btn btn-secondary">
            Brouillon
          </button>
          <button onClick={() => handleSubmit('active')} disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting ? <><RefreshCw size={15} className="spin" /> Lancement...</> : <><Send size={15} /> Lancer</>}
          </button>
        </div>
      </div>

      {errorNotice && (
        <div style={{ padding: '12px 16px', background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.85rem', marginBottom: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={16} /> {errorNotice}
        </div>
      )}

      {/* ── Main Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '28px', alignItems: 'start' }}>

        {/* ═══════════════════════════════════════════════════ */}
        {/* LEFT — Journey Builder                             */}
        {/* ═══════════════════════════════════════════════════ */}
        <div>
          {/* Campaign General Settings */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label className="label">Nom de la campagne</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" />
              </div>
              <div>
                <label className="label">Quota/jour</label>
                <input type="number" value={dailyLimit} onChange={e => setDailyLimit(Number(e.target.value))} className="input" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label">Fuseau</label>
                <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input" style={{ fontSize: '0.78rem', padding: '6px 10px' }}>
                  <option value="Africa/Kinshasa">Kinshasa (UTC+1)</option>
                  <option value="Europe/Paris">Paris (UTC+2)</option>
                  <option value="America/New_York">New York (EST)</option>
                  <option value="Europe/London">London (GMT)</option>
                </select>
              </div>
              <div>
                <label className="label">Début</label>
                <input type="time" value={scheduleStart} onChange={e => setScheduleStart(e.target.value)} className="input" style={{ fontSize: '0.82rem' }} />
              </div>
              <div>
                <label className="label">Fin</label>
                <input type="time" value={scheduleEnd} onChange={e => setScheduleEnd(e.target.value)} className="input" style={{ fontSize: '0.82rem' }} />
              </div>
            </div>

            {/* ── Pool d'expéditeurs rotatifs ── */}
            <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div>
                  <label className="label" style={{ marginBottom: '1px' }}>📤 Comptes expéditeurs de la campagne</label>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', margin: 0 }}>
                    Les envois sont distribués en rotation entre tous les comptes · {quotaPerSender} emails/jour par compte
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSenderPickerOpen(!senderPickerOpen)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Plus size={13} /> Ajouter
                </button>
              </div>

              {/* Account picker dropdown */}
              {senderPickerOpen && (
                <div style={{ marginBottom: '10px', padding: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginBottom: '8px' }}>Choisir un compte à ajouter au pool :</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {emailAccounts.filter(acc => !senderPool.includes(acc.id)).map(acc => (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => { addSenderToPool(acc.id); setSenderPickerOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '8px 12px',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer', textAlign: 'left', width: '100%',
                        }}
                      >
                        <Mail size={14} color="#f59e0b" />
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{acc.email}</div>
                          <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>{acc.provider} · limite {acc.dailyLimit || 50} emails/jour</div>
                        </div>
                      </button>
                    ))}
                    {emailAccounts.filter(acc => !senderPool.includes(acc.id)).length === 0 && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textAlign: 'center', padding: '8px' }}>
                        Tous vos comptes sont déjà dans le pool.
                        <br />Ajoutez des comptes dans <strong>Paramètres → Email</strong>.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Pool list */}
              {senderPool.length === 0 ? (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-sm)', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-subtle)' }}>
                  Aucun expéditeur. Cliquez « Ajouter » pour sélectionner vos comptes.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {senderPool.map((accountId, idx) => {
                    const acc = emailAccounts.find(a => a.id === accountId);
                    if (!acc) return null;
                    return (
                      <div key={accountId} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Mail size={13} color="#f59e0b" />
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ffffff' }}>{acc.email}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                              {acc.provider} · {quotaPerSender} emails/jour · Rotation #{idx + 1}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {acc.warmupScore !== undefined && (
                            <span style={{
                              fontSize: '0.68rem', fontWeight: 700,
                              padding: '2px 6px', borderRadius: '4px',
                              background: acc.warmupScore >= 70 ? 'rgba(16,185,129,0.15)' : acc.warmupScore >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                              color: acc.warmupScore >= 70 ? '#34d399' : acc.warmupScore >= 40 ? '#fbbf24' : '#f87171',
                            }}>
                              🔥 {acc.warmupScore}%
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeSenderFromPool(accountId)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', padding: '4px' }}
                            title="Retirer du pool"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Distribution summary */}
                  <div style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={12} />
                    <span>
                      <strong style={{ color: '#fff' }}>{senderPool.length} compte{senderPool.length > 1 ? 's' : ''}</strong> en rotation ·{' '}
                      <strong style={{ color: '#fff' }}>{dailyLimit}</strong> emails/jour au total ·{' '}
                      <strong style={{ color: '#fff' }}>{quotaPerSender}</strong> par compte
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Journey Visual Flow ── */}
          <div style={{ position: 'relative' }}>

            {/* START node */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Play size={14} color="#000000" fill="#000000" />
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Début du parcours</span>
            </div>

            {steps.map((step, idx) => {
              const isActive = activeStepId === step.id;
              const ch = CHANNELS.find(c => c.key === step.channel);
              const accountId = stepAccounts[step.id];
              const account = emailAccounts.find(a => a.id === accountId);

              return (
                <div key={step.id}>
                  {/* ── Connector line + delay badge ── */}
                  <div style={{ display: 'flex', alignItems: 'stretch', marginLeft: '17px' }}>
                    <div style={{ width: '2px', background: isActive ? '#ffffff' : 'rgba(255,255,255,0.12)', flexShrink: 0, minHeight: '8px' }} />
                    {step.delayDays > 0 && (
                      <div style={{ marginLeft: '16px', alignSelf: 'center', paddingTop: '4px', paddingBottom: '4px' }}>
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={11} /> {step.delayDays} jour{step.delayDays > 1 ? 's' : ''} d&apos;attente
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── Step Card ── */}
                  <div style={{ display: 'flex', alignItems: 'stretch' }}>
                    {/* Left line */}
                    <div style={{ width: '2px', background: 'rgba(255,255,255,0.12)', flexShrink: 0, marginLeft: '17px' }} />

                    {/* Card */}
                    <div
                      onClick={() => setActiveStepId(isActive ? null : step.id)}
                      style={{
                        flex: 1,
                        marginLeft: '16px',
                        marginBottom: '0',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        border: isActive ? `1px solid ${ch?.color || '#ffffff'}` : '1px solid var(--border-subtle)',
                        background: isActive ? `${ch?.bg}` : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Card header row */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                          <ChannelBadge channel={step.channel} size={14} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '0.68rem', fontWeight: 700, color: ch?.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                {actionLabel(step.type)}
                              </span>
                              <span style={{ fontSize: '0.62rem', color: 'var(--text-subtle)' }}>· Étape {step.order}</span>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                              {step.title}
                            </div>
                            {account && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                📤 {account.email}
                              </div>
                            )}
                            {step.subject && (
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '1px', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '240px' }}>
                                Objet: {step.subject}
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                          <button
                            onClick={e => { e.stopPropagation(); setActiveStepId(step.id); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
                            title="Éditer"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); deleteStep(step.id); }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '4px' }}
                            title="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Expanded: delay + account selector */}
                      {isActive && (
                        <div onClick={e => e.stopPropagation()} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {/* Delay */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <div>
                              <label className="label" style={{ fontSize: '0.68rem' }}>⏱ Délai avant cette étape</label>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <input
                                  type="number" min={0} max={60}
                                  value={step.delayDays}
                                  onChange={e => updateStep(step.id, { delayDays: Number(e.target.value) })}
                                  className="input"
                                  style={{ padding: '6px 8px', fontSize: '0.82rem' }}
                                />
                                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>jours</span>
                              </div>
                            </div>

                            {/* Account selector for email */}
                            {step.channel === 'email' && (
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>📤 Compte expéditeur Email</label>
                                <select
                                  value={stepAccounts[step.id] || ''}
                                  onChange={e => setStepAccounts(prev => ({ ...prev, [step.id]: e.target.value }))}
                                  className="input"
                                  style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                                >
                                  <option value="">-- Choisir un compte --</option>
                                  {emailAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>{acc.email} ({acc.provider})</option>
                                  ))}
                                  {emailAccounts.length === 0 && (
                                    <option disabled>Aucun compte configuré</option>
                                  )}
                                </select>
                              </div>
                            )}

                            {/* Sender ID for SMS */}
                            {step.channel === 'sms' && (
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>🏷️ Sender ID SMS (Nom d'expéditeur affiché)</label>
                                <input
                                  type="text"
                                  maxLength={11}
                                  value={step.senderId || 'RAYONS'}
                                  onChange={e => updateStep(step.id, { senderId: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                                  className="input"
                                  placeholder="RAYONS"
                                  style={{ fontSize: '0.82rem', fontFamily: 'monospace', fontWeight: 700 }}
                                />
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                                  {(step.senderId || 'RAYONS').length}/11 car. · Nom apparaissant sur le téléphone
                                </div>
                              </div>
                            )}

                            {/* Sender ID for RCS */}
                            {step.channel === 'rcs' && (
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>🤖 Nom de l'agent / Sender RCS</label>
                                <input
                                  type="text"
                                  value={step.senderId || 'Rayons Solutions'}
                                  onChange={e => updateStep(step.id, { senderId: e.target.value })}
                                  className="input"
                                  placeholder="Rayons Solutions"
                                  style={{ fontSize: '0.82rem', fontWeight: 600 }}
                                />
                                <div style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                                  Nom de l'entreprise affiché sur Google Messages
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Subject for email */}
                          {step.channel === 'email' && (
                            <>
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>Objet de l&apos;email</label>
                                <input
                                  type="text"
                                  value={step.subject || ''}
                                  onChange={e => updateStep(step.id, { subject: e.target.value })}
                                  className="input"
                                  style={{ fontSize: '0.82rem' }}
                                />
                              </div>
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>Corps du message</label>
                                <textarea
                                  rows={5}
                                  value={step.body || ''}
                                  onChange={e => updateStep(step.id, { body: e.target.value })}
                                  className="input"
                                  style={{ resize: 'vertical', fontSize: '0.82rem', fontFamily: 'inherit' }}
                                />
                              </div>
                              {/* Image template */}
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>🎨 Image personnalisée</label>
                                <select
                                  value={step.personalizedImageUrl || ''}
                                  onChange={e => updateStep(step.id, { personalizedImageUrl: e.target.value || undefined })}
                                  className="input"
                                  style={{ fontSize: '0.78rem', padding: '6px 8px' }}
                                >
                                  <option value="">-- Aucune image --</option>
                                  {imageTemplates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                                </select>
                              </div>
                              {/* A/B */}
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem' }}>
                                <input
                                  type="checkbox"
                                  checked={step.enableABTesting || false}
                                  onChange={e => updateStep(step.id, { enableABTesting: e.target.checked })}
                                />
                                Activer A/B Testing (variation B — 50/50)
                              </label>
                              {step.enableABTesting && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                                  <input type="text" placeholder="Objet Variation B" value={step.subjectB || ''} onChange={e => updateStep(step.id, { subjectB: e.target.value })} className="input" style={{ fontSize: '0.8rem' }} />
                                  <textarea rows={3} placeholder="Corps Variation B" value={step.bodyB || ''} onChange={e => updateStep(step.id, { bodyB: e.target.value })} className="input" style={{ fontSize: '0.8rem', resize: 'vertical' }} />
                                </div>
                              )}
                            </>
                          )}

                          {/* LinkedIn note */}
                          {step.type === 'linkedin_connect' && (
                            <div>
                              <label className="label" style={{ fontSize: '0.68rem' }}>Note d&apos;invitation (max 300 car.)</label>
                              <textarea
                                rows={3}
                                value={step.linkedInNote || ''}
                                onChange={e => updateStep(step.id, { linkedInNote: e.target.value })}
                                className="input"
                                style={{ resize: 'vertical', fontSize: '0.82rem' }}
                                maxLength={300}
                              />
                              <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textAlign: 'right' }}>{(step.linkedInNote || '').length}/300</div>
                            </div>
                          )}

                          {step.type === 'linkedin_message' && (
                            <div>
                              <label className="label" style={{ fontSize: '0.68rem' }}>Message privé LinkedIn</label>
                              <textarea rows={4} value={step.body || ''} onChange={e => updateStep(step.id, { body: e.target.value })} className="input" style={{ resize: 'vertical', fontSize: '0.82rem' }} />
                            </div>
                          )}

                          {step.channel === 'sms' && (() => {
                            const currentText = step.smsBody || step.body || '';
                            const smsInfo = analyzeSmsText(currentText);

                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <label className="label" style={{ fontSize: '0.68rem', marginBottom: 0 }}>
                                      Contenu du SMS Opérateur *
                                    </label>
                                    <span style={{
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      color: smsInfo.isGsm7 ? '#34d399' : '#f59e0b',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px'
                                    }}>
                                      {smsInfo.isGsm7 ? '✓ Standard GSM-7 (160 car./SMS)' : '⚠️ Mode UCS-2 Unicode (70 car./SMS)'}
                                    </span>
                                  </div>

                                  <textarea 
                                    rows={3} 
                                    value={currentText} 
                                    onChange={e => updateStep(step.id, { smsBody: e.target.value })} 
                                    className="input" 
                                    placeholder="Bonjour {{firstName}}, je vous recontacte. Répondez STOP pour vous désabonner."
                                    style={{ resize: 'vertical', fontSize: '0.82rem' }} 
                                  />

                                  {/* Compteur métrique GSM en direct */}
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.72rem' }}>
                                    <span style={{ color: 'var(--text-subtle)' }}>
                                      {smsInfo.weightedLength} caractère{smsInfo.weightedLength > 1 ? 's' : ''} · <strong style={{ color: '#ffffff' }}>{smsInfo.partsCount} SMS facturé{smsInfo.partsCount > 1 ? 's' : ''}</strong> ({smsInfo.remainingInPart} restant{smsInfo.remainingInPart > 1 ? 's' : ''} sur le segment)
                                    </span>

                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                      Sender ID : <strong style={{ color: '#a78bfa' }}>{step.senderId || 'RAYONS'}</strong>
                                    </span>
                                  </div>
                                </div>

                                {/* Détection et correction des caractères spéciaux */}
                                {!smsInfo.isGsm7 && (
                                  <div style={{
                                    padding: '10px 12px',
                                    background: 'rgba(245, 158, 11, 0.08)',
                                    border: '1px solid #f59e0b',
                                    borderRadius: 'var(--radius-sm)',
                                    fontSize: '0.75rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '6px'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                                      <div>
                                        <span style={{ fontWeight: 700, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          <AlertCircle size={13} /> Caractères spéciaux non GSM détectés :
                                        </span>
                                        <div style={{ color: '#ffffff', marginTop: '3px', fontFamily: 'monospace' }}>
                                          {smsInfo.nonGsmCharacters.map((c, i) => (
                                            <span key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '3px', marginRight: '4px' }}>
                                              {c === ' ' ? 'Espace spécial' : c}
                                            </span>
                                          ))}
                                        </div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px' }}>
                                          Ces caractères forcent l'envoi en Unicode (coût doublé ou risque de caractères "?" chez certains opérateurs).
                                        </div>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() => updateStep(step.id, { smsBody: cleanSmsText(currentText) })}
                                        className="btn btn-sm"
                                        style={{ background: '#f59e0b', color: '#000000', fontWeight: 700, fontSize: '0.7rem', padding: '5px 10px', whiteSpace: 'nowrap' }}
                                        title="Convertir automatiquement les apostrophes courbes, accents complexes et tirets en GSM-7"
                                      >
                                        ✨ Optimiser GSM-7
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Auto-clean toggle */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                  <input
                                    type="checkbox"
                                    id={`autoclean-${step.id}`}
                                    checked={step.autoCleanGsm !== false}
                                    onChange={e => updateStep(step.id, { autoCleanGsm: e.target.checked })}
                                  />
                                  <label htmlFor={`autoclean-${step.id}`} style={{ cursor: 'pointer' }}>
                                    Nettoyer automatiquement les caractères spéciaux à l'envoi (Recommandé)
                                  </label>
                                </div>
                              </div>
                            );
                          })()}

                          {step.channel === 'rcs' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>Titre de la Carte Google RCS *</label>
                                <input
                                  type="text"
                                  value={step.rcsTitle || step.subject || ''}
                                  onChange={e => updateStep(step.id, { rcsTitle: e.target.value })}
                                  className="input"
                                  placeholder="Ex: Nouvelle Solution Rayons"
                                  style={{ fontSize: '0.82rem' }}
                                />
                              </div>
                              <div>
                                <label className="label" style={{ fontSize: '0.68rem' }}>Corps / Description RCS *</label>
                                <textarea
                                  rows={3}
                                  value={step.rcsBody || step.body || ''}
                                  onChange={e => updateStep(step.id, { rcsBody: e.target.value })}
                                  className="input"
                                  placeholder="Message interactif avec boutons..."
                                  style={{ resize: 'vertical', fontSize: '0.82rem' }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Variables chips */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', alignSelf: 'center' }}>Variables :</span>
                            {['firstName', 'lastName', 'company', 'jobTitle', 'icebreaker'].map(v => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => {
                                  const tag = `{{${v}}}`;
                                  if (step.channel === 'email') updateStep(step.id, { body: (step.body || '') + ' ' + tag });
                                  else if (step.type === 'linkedin_connect') updateStep(step.id, { linkedInNote: (step.linkedInNote || '') + ' ' + tag });
                                  else updateStep(step.id, { body: (step.body || '') + ' ' + tag });
                                }}
                                style={{ background: '#080808', color: v === 'icebreaker' ? '#c084fc' : '#fff', border: v === 'icebreaker' ? '1px solid #c084fc' : '1px solid var(--border-subtle)', borderRadius: '3px', padding: '2px 7px', fontSize: '0.68rem', cursor: 'pointer', fontFamily: 'monospace' }}
                              >
                                {`{{${v}}}`}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End of steps connector */}
            <div style={{ display: 'flex', alignItems: 'stretch', marginLeft: '17px' }}>
              <div style={{ width: '2px', background: 'rgba(255,255,255,0.12)', minHeight: '16px', flexShrink: 0 }} />
            </div>

            {/* ── Add Step button or picker ── */}
            {!showPicker ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '0', marginTop: '0' }}>
                <div style={{ width: '35px', display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => setShowPicker(true)}
                    style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px dashed rgba(255,255,255,0.3)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--text-muted)',
                      transition: 'all 0.2s ease',
                    }}
                    title="Ajouter une étape"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', cursor: 'pointer' }} onClick={() => setShowPicker(true)}>
                  Ajouter une étape au parcours
                </span>
              </div>
            ) : (
              /* ── STEP PICKER PANEL ── */
              <div style={{ marginLeft: '35px', marginTop: '4px', padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Choisir le canal</span>
                  <button onClick={() => { setShowPicker(false); setPickerChannel(null); setPickerAction(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <X size={16} />
                  </button>
                </div>

                {/* STEP 1: Channel selection */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '14px' }}>
                  {CHANNELS.map(ch => {
                    const Icon = ch.icon;
                    const sel = pickerChannel === ch.key;
                    const allowed = hasUpgradeFor(ch.key);
                    const isUpgrade = ['sms', 'rcs', 'linkedin'].includes(ch.key);

                    return (
                      <button
                        key={ch.key}
                        type="button"
                        onClick={() => {
                          if (!allowed && isUpgrade) {
                            setUpgradeBlockedChannel(ch.key as any);
                            return;
                          }
                          setPickerChannel(ch.key);
                          setPickerAction(ACTIONS_BY_CHANNEL[ch.key]?.[0]?.key || null);
                        }}
                        style={{
                          padding: '10px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: sel ? ch.bg : (!allowed && isUpgrade) ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.02)',
                          border: sel ? `1px solid ${ch.color}` : (!allowed && isUpgrade) ? '1px dashed rgba(255,255,255,0.2)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                          position: 'relative',
                          opacity: (!allowed && isUpgrade) ? 0.8 : 1,
                          transition: 'all 0.15s ease',
                        }}
                        title={(!allowed && isUpgrade) ? `Option ${ch.label} non incluse - Cliquez pour détails` : ch.label}
                      >
                        {(!allowed && isUpgrade) && (
                          <span style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            fontSize: '0.52rem',
                            fontWeight: 700,
                            background: 'rgba(239, 68, 68, 0.2)',
                            color: '#f87171',
                            border: '1px solid #f87171',
                            borderRadius: '3px',
                            padding: '1px 3px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}>
                            <Lock size={8} /> OPTION
                          </span>
                        )}
                        <Icon size={18} color={sel ? ch.color : (!allowed && isUpgrade) ? 'var(--text-subtle)' : 'var(--text-muted)'} />
                        <span style={{ fontSize: '0.68rem', fontWeight: 600, color: sel ? ch.color : 'var(--text-subtle)', textAlign: 'center' }}>
                          {ch.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* STEP 2: Action selection */}
                {pickerChannel && ACTIONS_BY_CHANNEL[pickerChannel]?.length > 1 && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Action</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                      {ACTIONS_BY_CHANNEL[pickerChannel].map(action => (
                        <button
                          key={action.key}
                          onClick={() => setPickerAction(action.key)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: 'var(--radius-sm)',
                            background: pickerAction === action.key ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                            border: pickerAction === action.key ? '1px solid rgba(255,255,255,0.3)' : '1px solid var(--border-subtle)',
                            cursor: 'pointer', textAlign: 'left', width: '100%',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{action.label}</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '2px' }}>{action.sub}</div>
                          </div>
                          {pickerAction === action.key && <Check size={14} color="#ffffff" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* STEP 3: Account selector (email/sms/rcs) */}
                {pickerChannel && ['email', 'sms', 'rcs'].includes(pickerChannel) && (
                  <>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Compte expéditeur</div>
                    <select
                      value={pickerAccount}
                      onChange={e => setPickerAccount(e.target.value)}
                      className="input"
                      style={{ marginBottom: '14px', fontSize: '0.82rem' }}
                    >
                      <option value="">-- Choisir un compte --</option>
                      {emailAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.email} — {acc.provider}</option>
                      ))}
                      {emailAccounts.length === 0 && <option disabled>Aucun compte configuré — allez dans Paramètres &gt; Email</option>}
                    </select>
                  </>
                )}

                {/* STEP 4: Delay */}
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Délai avant cette étape</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <input
                    type="number" min={0} max={60}
                    value={pickerDelay}
                    onChange={e => setPickerDelay(Number(e.target.value))}
                    className="input"
                    style={{ width: '80px', fontSize: '0.85rem' }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>jour(s) après l&apos;étape précédente</span>
                </div>

                {/* Confirm */}
                <button
                  onClick={confirmAddStep}
                  disabled={!pickerChannel || !pickerAction}
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <Plus size={15} /> Ajouter cette étape au parcours
                </button>
              </div>
            )}

            {/* Journey end marker */}
            {!showPicker && (
              <div style={{ marginTop: '16px', marginLeft: '35px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '20px' }}>
                  <CheckCircle2 size={13} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Fin du parcours — {steps.length} étape{steps.length > 1 ? 's' : ''} configurée{steps.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/* RIGHT — Live Preview                               */}
        {/* ═══════════════════════════════════════════════════ */}
        <div style={{ position: 'sticky', top: '90px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Eye size={17} />
                  <h2 style={{ fontSize: '1rem', fontWeight: 700 }}>Aperçu en Direct</h2>
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>Variables interpolées avec les données du prospect</p>
              </div>
              <select
                value={previewLeadIdx}
                onChange={e => setPreviewLeadIdx(Number(e.target.value))}
                className="input"
                style={{ width: 'auto', fontSize: '0.75rem', padding: '5px 10px' }}
              >
                {leads.map((l, i) => (
                  <option key={l.id} value={i}>{l.firstName} {l.lastName} · {l.company}</option>
                ))}
              </select>
            </div>

            {/* Prospect card */}
            {previewLead && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: '#000000', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                  {previewLead.firstName[0]}{previewLead.lastName?.[0] || ''}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{previewLead.firstName} {previewLead.lastName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>{previewLead.jobTitle} · {previewLead.company}</div>
                </div>
              </div>
            )}

            {/* Timeline preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {steps.map((step, idx) => {
                const ch = CHANNELS.find(c => c.key === step.channel);
                const isSelected = activeStepId === step.id;
                return (
                  <div key={step.id}>
                    {idx > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '12px', height: '24px' }}>
                        <div style={{ width: '2px', height: '100%', background: 'rgba(255,255,255,0.08)' }} />
                        {step.delayDays > 0 && <span style={{ marginLeft: '8px', fontSize: '0.62rem', color: 'var(--text-subtle)' }}>+{step.delayDays}j</span>}
                      </div>
                    )}
                    <div
                      onClick={() => setActiveStepId(step.id)}
                      style={{
                        display: 'flex', gap: '10px', padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? ch?.bg : 'transparent',
                        border: isSelected ? `1px solid ${ch?.color}44` : '1px solid transparent',
                        cursor: 'pointer', transition: 'all 0.15s ease',
                      }}
                    >
                      <ChannelBadge channel={step.channel} size={13} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: ch?.color, textTransform: 'uppercase' }}>{actionLabel(step.type)}</div>
                        {step.subject && previewLead && (
                          <div style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {interpolate(step.subject, previewLead)}
                          </div>
                        )}
                        {step.body && previewLead && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {interpolate(step.body, previewLead).slice(0, 80)}…
                          </div>
                        )}
                        {step.type === 'linkedin_visit' && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Visite discrète du profil → déclenche notification « Vue »
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Full email preview */}
            {activeStep?.channel === 'email' && previewLead && (
              <div style={{ marginTop: '16px', padding: '14px', background: '#050505', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>Rendu complet de l&apos;email</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px' }}>
                  {interpolate(activeStep.subject || '', previewLead) || 'Sans objet'}
                </div>
                {activeStep.personalizedImageUrl && (
                  <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '14px', textAlign: 'center', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Image personnalisée pour</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>{previewLead.firstName} @ {previewLead.company}</div>
                  </div>
                )}
                <div style={{ fontSize: '0.84rem', lineHeight: '1.65', color: '#e5e5e5', whiteSpace: 'pre-line' }}>
                  {interpolate(activeStep.body || '', previewLead)}
                </div>
              </div>
            )}

            <div style={{ marginTop: '14px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              💡 <strong>Astuce Lemlist</strong> : Combinez une visite LinkedIn + un email avec image personnalisée pour <strong>3,4× plus de réponses</strong>.
            </div>
          </div>
        </div>
      </div>

      {/* ── MODAL UPGRADE BLOQUÉ ── */}
      {upgradeBlockedChannel && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div className="card" style={{
            maxWidth: '520px',
            width: '100%',
            border: '1px solid #ffffff',
            background: '#000000',
            padding: '28px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Lock size={22} color="#ef4444" />
              </div>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Option Non Incluse dans Votre Offre
                </h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Upgrade requis pour débloquer ce canal de communication
                </div>
              </div>
            </div>

            <div style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '20px',
              fontSize: '0.85rem',
              lineHeight: '1.6'
            }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>
                Votre abonnement initial comprend uniquement le <strong style={{ color: '#ffffff' }}>Cold Email Marketing ({pricing.baseEmailPrice} $/mois)</strong> avec comptes SMTP illimités et chauffe Lemwarm.
              </p>

              {upgradeBlockedChannel === 'sms' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Smartphone size={16} /> Canal SMS Direct Opérateur
                  </div>
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                    Ce canal nécessite l'activation de l'upgrade SMS par l'administrateur.
                    <br />
                    • Tarif unitaire : <strong style={{ color: '#ffffff' }}>{pricing.smsUnitPrice} $ / SMS</strong>
                    <br />
                    • Pack standard : <strong style={{ color: '#ffffff' }}>{pricing.smsPackPrice1000} $ les 1 000 SMS</strong>
                  </p>
                </div>
              )}

              {upgradeBlockedChannel === 'rcs' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MessageSquare size={16} /> Canal RCS Google RBM Cloud
                  </div>
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                    Ce canal interactif nécessite l'activation de l'upgrade RCS par l'administrateur.
                    <br />
                    • Tarif unitaire : <strong style={{ color: '#ffffff' }}>{pricing.rcsUnitPrice} $ / message RCS</strong>
                    <br />
                    • Pack standard : <strong style={{ color: '#ffffff' }}>{pricing.rcsPackPrice1000} $ les 1 000 RCS</strong>
                  </p>
                </div>
              )}

              {upgradeBlockedChannel === 'linkedin' && (
                <div>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={16} /> Canal Automatisation LinkedIn B2B
                  </div>
                  <p style={{ color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                    Ce canal automatise vos visites de profil, demandes de connexion et messages InMail.
                    <br />
                    • Option mensuelle : <strong style={{ color: '#ffffff' }}>{pricing.linkedinMonthlyPrice} $ / mois</strong>
                  </p>
                </div>
              )}
            </div>

            <div style={{
              padding: '12px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem',
              color: '#f59e0b',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>
                Pour activer cette offre et approvisionner votre solde de crédits, veuillez contacter votre administrateur C-Panel ou le support commercial.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setUpgradeBlockedChannel(null)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Compris, fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
