'use client';

import React, { useState } from 'react';
import {
  Settings,
  Clock,
  Globe,
  Building2,
  Bell,
  Save,
  CheckCircle2,
  Calendar,
  Shield,
  Link2,
  Mail,
  Smartphone,
  MessageSquare,
  Info,
  ChevronDown,
  Sliders,
  AlertCircle,
  Zap,
  User,
  CreditCard,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getSaasPricing, DEFAULT_SAAS_PRICING } from '@/lib/userStore';

// ── Types locaux ──────────────────────────────────────────────
interface DaySlot {
  enabled: boolean;
  start: string;
  end: string;
}

interface ChannelSchedule {
  email: DaySlot;
  sms: DaySlot;
  rcs: DaySlot;
  linkedin: DaySlot;
}

type DayKey = 'lun' | 'mar' | 'mer' | 'jeu' | 'ven' | 'sam' | 'dim';

const DAYS: { key: DayKey; label: string; short: string }[] = [
  { key: 'lun', label: 'Lundi',    short: 'L' },
  { key: 'mar', label: 'Mardi',    short: 'M' },
  { key: 'mer', label: 'Mercredi', short: 'M' },
  { key: 'jeu', label: 'Jeudi',    short: 'J' },
  { key: 'ven', label: 'Vendredi', short: 'V' },
  { key: 'sam', label: 'Samedi',   short: 'S' },
  { key: 'dim', label: 'Dimanche', short: 'D' },
];

const TIMEZONES = [
  'Africa/Kinshasa',
  'Africa/Lagos',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Casablanca',
  'Europe/Paris',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Asia/Dubai',
];

export default function GeneralSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'subscription' | 'schedule' | 'notifications' | 'security'>('general');
  const [saved, setSaved] = useState(false);
  const { user, trialStatus } = useAuth();
  const [pricing, setPricing] = useState(DEFAULT_SAAS_PRICING);

  React.useEffect(() => {
    setPricing(getSaasPricing());
  }, []);

  // ── Paramètres Généraux ──────────────────────────────────
  const [companyName, setCompanyName] = useState('Rayons Solutions');
  const [senderName, setSenderName] = useState('Daniel Kiboko');
  const [replyToEmail, setReplyToEmail] = useState('crm@rayons.net');
  const [timezone, setTimezone] = useState('Africa/Kinshasa');
  const [language, setLanguage] = useState('fr');
  const [domainBase, setDomainBase] = useState('crm.rayons.net');
  const [trackingDomain, setTrackingDomain] = useState('track.rayons.net');
  const [unsubscribeUrl, setUnsubscribeUrl] = useState('https://crm.rayons.net/unsubscribe');
  const [logoUrl, setLogoUrl] = useState('');
  const [address, setAddress] = useState('Kinshasa, RD Congo');
  const [dailyGlobalCap, setDailyGlobalCap] = useState(500);
  const [defaultDailyLimit, setDefaultDailyLimit] = useState(50);
  const [minDelaySec, setMinDelaySec] = useState(60);
  const [maxDelaySec, setMaxDelaySec] = useState(180);
  const [enableTracking, setEnableTracking] = useState(true);
  const [plainTextMode, setPlainTextMode] = useState(false);

  // ── Plages Horaires ──────────────────────────────────────
  const defaultDaySlot: DaySlot = { enabled: true, start: '08:30', end: '18:00' };
  const defaultWeekend: DaySlot = { enabled: false, start: '09:00', end: '13:00' };

  const [globalSchedule, setGlobalSchedule] = useState<Record<DayKey, DaySlot>>({
    lun: { ...defaultDaySlot },
    mar: { ...defaultDaySlot },
    mer: { ...defaultDaySlot },
    jeu: { ...defaultDaySlot },
    ven: { ...defaultDaySlot },
    sam: { ...defaultWeekend },
    dim: { enabled: false, start: '09:00', end: '12:00' },
  });

  const [usePerChannel, setUsePerChannel] = useState(false);
  const [channelSchedules, setChannelSchedules] = useState<Record<string, Record<DayKey, DaySlot>>>({
    email:    { lun: { ...defaultDaySlot }, mar: { ...defaultDaySlot }, mer: { ...defaultDaySlot }, jeu: { ...defaultDaySlot }, ven: { ...defaultDaySlot }, sam: { ...defaultWeekend }, dim: { enabled: false, start: '09:00', end: '12:00' } },
    sms:      { lun: { ...defaultDaySlot, start: '09:00' }, mar: { ...defaultDaySlot, start: '09:00' }, mer: { ...defaultDaySlot, start: '09:00' }, jeu: { ...defaultDaySlot, start: '09:00' }, ven: { ...defaultDaySlot, start: '09:00' }, sam: { enabled: false, start: '09:00', end: '12:00' }, dim: { enabled: false, start: '09:00', end: '12:00' } },
    rcs:      { lun: { ...defaultDaySlot, start: '09:00' }, mar: { ...defaultDaySlot, start: '09:00' }, mer: { ...defaultDaySlot, start: '09:00' }, jeu: { ...defaultDaySlot, start: '09:00' }, ven: { ...defaultDaySlot, start: '09:00' }, sam: { enabled: false, start: '09:00', end: '12:00' }, dim: { enabled: false, start: '09:00', end: '12:00' } },
    linkedin: { lun: { ...defaultDaySlot }, mar: { ...defaultDaySlot }, mer: { ...defaultDaySlot }, jeu: { ...defaultDaySlot }, ven: { ...defaultDaySlot }, sam: { enabled: false, start: '09:00', end: '12:00' }, dim: { enabled: false, start: '09:00', end: '12:00' } },
  });

  const [blackoutDates, setBlackoutDates] = useState<string[]>([
    '2026-12-25', '2026-01-01', '2026-06-30'
  ]);
  const [newBlackout, setNewBlackout] = useState('');

  // ── Notifications ─────────────────────────────────────────
  const [notifNewReply, setNotifNewReply] = useState(true);
  const [notifCampaignEnd, setNotifCampaignEnd] = useState(true);
  const [notifBounce, setNotifBounce] = useState(true);
  const [notifLowScore, setNotifLowScore] = useState(true);
  const [notifEmail, setNotifEmail] = useState('danielkiboko218@gmail.com');
  const [notifWebhook, setNotifWebhook] = useState('');

  // ── Save ─────────────────────────────────────────────────
  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateGlobalDay = (day: DayKey, field: keyof DaySlot, value: boolean | string) => {
    setGlobalSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  };

  const updateChannelDay = (channel: string, day: DayKey, field: keyof DaySlot, value: boolean | string) => {
    setChannelSchedules(prev => ({
      ...prev,
      [channel]: { ...prev[channel], [day]: { ...prev[channel][day], [field]: value } }
    }));
  };

  const addBlackout = () => {
    if (newBlackout && !blackoutDates.includes(newBlackout)) {
      setBlackoutDates([...blackoutDates, newBlackout].sort());
      setNewBlackout('');
    }
  };

  const channelIcons: Record<string, React.ReactNode> = {
    email:    <Mail size={14} />,
    sms:      <Smartphone size={14} />,
    rcs:      <MessageSquare size={14} />,
    linkedin: <Zap size={14} />,
  };

  const channelLabels: Record<string, string> = {
    email: 'Email',
    sms: 'SMS Direct',
    rcs: 'Google RCS',
    linkedin: 'LinkedIn',
  };

  // ── Day Schedule Row ──────────────────────────────────────
  const DayRow = ({
    day, slot, onChange
  }: {
    day: { key: DayKey; label: string; short: string };
    slot: DaySlot;
    onChange: (field: keyof DaySlot, value: boolean | string) => void;
  }) => (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '120px 48px 1fr 1fr auto',
      gap: '12px',
      alignItems: 'center',
      padding: '10px 14px',
      borderRadius: 'var(--radius-sm)',
      background: slot.enabled ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
      border: `1px solid ${slot.enabled ? 'var(--border-subtle)' : 'rgba(255,255,255,0.05)'}`,
      opacity: slot.enabled ? 1 : 0.5,
      transition: 'all 0.15s ease',
    }}>
      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: slot.enabled ? '#ffffff' : 'var(--text-subtle)' }}>
        {day.label}
      </span>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => onChange('enabled', !slot.enabled)}
        style={{
          width: '40px',
          height: '22px',
          borderRadius: '11px',
          background: slot.enabled ? '#ffffff' : 'rgba(255,255,255,0.12)',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          transition: 'background 0.2s ease',
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: '3px',
          left: slot.enabled ? '21px' : '3px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: slot.enabled ? '#000000' : '#666666',
          transition: 'left 0.2s ease',
        }} />
      </button>

      {/* Start */}
      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>Début</label>
        <input
          type="time"
          value={slot.start}
          onChange={(e) => onChange('start', e.target.value)}
          disabled={!slot.enabled}
          className="input"
          style={{ padding: '6px 10px', fontSize: '0.85rem', width: '100%' }}
        />
      </div>

      {/* End */}
      <div>
        <label style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' }}>Fin</label>
        <input
          type="time"
          value={slot.end}
          onChange={(e) => onChange('end', e.target.value)}
          disabled={!slot.enabled}
          className="input"
          style={{ padding: '6px 10px', fontSize: '0.85rem', width: '100%' }}
        />
      </div>

      {/* Duration badge */}
      <div style={{ textAlign: 'right', minWidth: '60px' }}>
        {slot.enabled ? (() => {
          const [sh, sm] = slot.start.split(':').map(Number);
          const [eh, em] = slot.end.split(':').map(Number);
          const mins = (eh * 60 + em) - (sh * 60 + sm);
          const h = Math.floor(mins / 60);
          const m = mins % 60;
          return (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'Space Grotesk' }}>
              {h}h{m > 0 ? `${m}m` : ''}
            </span>
          );
        })() : (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Off</span>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Paramètres Généraux</h1>
            <span className="badge" style={{ fontSize: '0.7rem' }}>GLOBAL</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '680px' }}>
            Configuration globale de la plateforme CRM : identité, fuseaux horaires, plages d&apos;envoi par canal et règles de livraison.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '140px' }}
        >
          {saved ? <><CheckCircle2 size={16} /> Sauvegardé !</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '28px', overflowX: 'auto' }}>
        {[
          { id: 'general',       label: 'Paramètres Généraux', icon: Settings },
          { id: 'subscription',  label: 'Mon Forfait & Upgrades', icon: CreditCard },
          { id: 'schedule',      label: 'Plages Horaires',      icon: Clock },
          { id: 'notifications', label: 'Notifications',        icon: Bell },
          { id: 'security',      label: 'Sécurité & Accès',     icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 0 — MON FORFAIT & UPGRADES (SAAS BUSINESS)       */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'subscription' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Base Plan Card */}
          <div className="card" style={{ border: '1px solid #ffffff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Mail size={20} color="#f59e0b" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Forfait de Base : Cold Emailing Standard</h2>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
                {trialStatus.isSuperAdmin ? 'SUPER ADMIN (ILLIMITÉ)' : trialStatus.isProActive ? 'PRO ACTIF' : 'ESSAI 7 JOURS'}
              </span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '16px' }}>
              Votre abonnement initial comprend la suite complète Cold Emailing : séquences automatisées, connexion multi-comptes SMTP, chauffe de réputation Lemwarm, Unibox et CRM.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tarif Abonnement Base</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {pricing.baseEmailPrice} $ <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ mois</span>
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Canal Email Inclus</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                  Illimité
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Statut Licence</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginTop: '4px' }}>
                  {trialStatus.isSuperAdmin ? 'Accès Maître' : trialStatus.isProActive ? 'Licence Pro Validée' : `${trialStatus.daysRemaining}j d'essai`}
                </div>
              </div>
            </div>
          </div>

          {/* Upgrades & Add-ons Grid */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={16} color="#facc15" />
              Upgrades & Options Payantes Disponibles
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {/* SMS Upgrade Card */}
              <div className="card" style={{ padding: '18px', border: user?.hasSmsUpgrade || trialStatus.isSuperAdmin ? '1px solid #a78bfa' : '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Smartphone size={18} color="#a78bfa" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>SMS Direct Opérateur</span>
                  </div>
                  <span className="badge" style={{
                    fontSize: '0.65rem',
                    background: user?.hasSmsUpgrade || trialStatus.isSuperAdmin ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: user?.hasSmsUpgrade || trialStatus.isSuperAdmin ? '#a78bfa' : 'var(--text-muted)',
                    border: user?.hasSmsUpgrade || trialStatus.isSuperAdmin ? '1px solid #a78bfa' : '1px solid var(--border-subtle)'
                  }}>
                    {user?.hasSmsUpgrade || trialStatus.isSuperAdmin ? 'ACTIF' : 'NON INCLUS'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.4', marginBottom: '12px' }}>
                  Envoi direct via route SMPP avec Sender ID personnalisé et accusés de réception temps réel (DLR).
                </p>

                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tarification Officielle</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {pricing.smsUnitPrice} $ / SMS <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>({pricing.smsPackPrice1000} $ les 1 000)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Solde de crédits :</span>
                  <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                    {trialStatus.isSuperAdmin ? 'Illimité' : `${user?.smppCredits ?? 0} SMS`}
                  </strong>
                </div>
              </div>

              {/* RCS Upgrade Card */}
              <div className="card" style={{ padding: '18px', border: user?.hasRcsUpgrade || trialStatus.isSuperAdmin ? '1px solid #34d399' : '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MessageSquare size={18} color="#34d399" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Google RCS RBM</span>
                  </div>
                  <span className="badge" style={{
                    fontSize: '0.65rem',
                    background: user?.hasRcsUpgrade || trialStatus.isSuperAdmin ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: user?.hasRcsUpgrade || trialStatus.isSuperAdmin ? '#34d399' : 'var(--text-muted)',
                    border: user?.hasRcsUpgrade || trialStatus.isSuperAdmin ? '1px solid #34d399' : '1px solid var(--border-subtle)'
                  }}>
                    {user?.hasRcsUpgrade || trialStatus.isSuperAdmin ? 'ACTIF' : 'NON INCLUS'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.4', marginBottom: '12px' }}>
                  Messages multimédias interactifs Android avec cartes carrousel, boutons d'action et logo vérifié.
                </p>

                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tarification Officielle</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    {pricing.rcsUnitPrice} $ / RCS <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>({pricing.rcsPackPrice1000} $ les 1 000)</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Solde de crédits :</span>
                  <strong style={{ color: '#ffffff', fontFamily: 'monospace' }}>
                    {trialStatus.isSuperAdmin ? 'Illimité' : `${user?.rcsCredits ?? 0} RCS`}
                  </strong>
                </div>
              </div>

              {/* LinkedIn Upgrade Card */}
              <div className="card" style={{ padding: '18px', border: user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? '1px solid #38bdf8' : '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#38bdf8" />
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>LinkedIn B2B Outreach</span>
                  </div>
                  <span className="badge" style={{
                    fontSize: '0.65rem',
                    background: user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)',
                    color: user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? '#38bdf8' : 'var(--text-muted)',
                    border: user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? '1px solid #38bdf8' : '1px solid var(--border-subtle)'
                  }}>
                    {user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? 'ACTIF' : 'NON INCLUS'}
                  </span>
                </div>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', lineHeight: '1.4', marginBottom: '12px' }}>
                  Automatisation des visites de profils ciblés, invitations avec note et messages InMail.
                </p>

                <div style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Tarification Optionnelle</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                    +{pricing.linkedinMonthlyPrice} $ <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>/ mois</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>Statut :</span>
                  <strong style={{ color: user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? '#38bdf8' : 'var(--text-subtle)' }}>
                    {user?.hasLinkedinUpgrade || trialStatus.isSuperAdmin ? 'Débloqué' : 'Non souscrit'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade activation notice */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck size={20} color="#ffffff" />
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                  Besoin d'activer un upgrade ou d'acheter des packs de crédits ?
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Les upgrades sont activés instantanément depuis le C-Panel Super-Admin dès réception de votre règlement.
                </div>
              </div>
            </div>

            {trialStatus.isSuperAdmin && (
              <a href="/cpanel/subscriptions" className="btn btn-secondary btn-sm" style={{ whiteSpace: 'nowrap' }}>
                Accéder au C-Panel Subscriptions
              </a>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 1 — PARAMÈTRES GÉNÉRAUX                          */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Identité de l'Organisation */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Building2 size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Identité de l&apos;Organisation</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Nom de l&apos;entreprise *</label>
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input" placeholder="Rayons Solutions" />
              </div>
              <div>
                <label className="label">Nom d&apos;expéditeur par défaut *</label>
                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} className="input" placeholder="Daniel Kiboko" />
              </div>
              <div>
                <label className="label">Email de réponse (Reply-To)</label>
                <input type="email" value={replyToEmail} onChange={e => setReplyToEmail(e.target.value)} className="input" placeholder="crm@rayons.net" />
              </div>
              <div>
                <label className="label">Adresse physique (mention légale)</label>
                <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="input" placeholder="Kinshasa, RD Congo" />
              </div>
              <div>
                <label className="label">URL du Logo (PNG ou SVG)</label>
                <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="input" placeholder="https://rayons.net/logo.png" />
              </div>
            </div>
          </div>

          {/* Localisation */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Globe size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Localisation & Fuseau Horaire</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Fuseau horaire principal *</label>
                <div style={{ position: 'relative' }}>
                  <select value={timezone} onChange={e => setTimezone(e.target.value)} className="input" style={{ paddingRight: '32px', appearance: 'none' }}>
                    {TIMEZONES.map(tz => <option key={tz} value={tz}>{tz.replace('_', ' ')}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-subtle)' }} />
                </div>
              </div>
              <div>
                <label className="label">Langue de l&apos;interface</label>
                <div style={{ position: 'relative' }}>
                  <select value={language} onChange={e => setLanguage(e.target.value)} className="input" style={{ paddingRight: '32px', appearance: 'none' }}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                    <option value="sw">Kiswahili</option>
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-subtle)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Domaines & Tracking */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Link2 size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Domaines & Tracking</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label className="label">Domaine CRM (base URL webhooks)</label>
                <input type="text" value={domainBase} onChange={e => setDomainBase(e.target.value)} className="input" placeholder="crm.rayons.net" />
              </div>
              <div>
                <label className="label">Domaine de tracking personnalisé</label>
                <input type="text" value={trackingDomain} onChange={e => setTrackingDomain(e.target.value)} className="input" placeholder="track.rayons.net" />
              </div>
              <div>
                <label className="label">URL de désabonnement (Lien STOP)</label>
                <input type="text" value={unsubscribeUrl} onChange={e => setUnsubscribeUrl(e.target.value)} className="input" placeholder="https://crm.rayons.net/unsubscribe" />
              </div>
            </div>

            {/* Toggles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              {[
                { label: 'Tracking ouverture & clics activé', sub: 'Injecte un pixel de tracking invisible et des liens redirigés', val: enableTracking, set: setEnableTracking },
                { label: 'Mode texte brut (Plain-Text)', sub: 'Recommandé pour éviter les onglets Promotions/Spam', val: plainTextMode, set: setPlainTextMode },
              ].map(({ label, sub, val, set }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '2px' }}>{sub}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(!val)}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', background: val ? '#ffffff' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: '4px', left: val ? '23px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: val ? '#000' : '#666', transition: 'left 0.2s' }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quotas & Délais */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Sliders size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Quotas & Délais d&apos;Envoi</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              {[
                { label: 'Cap global journalier', sub: 'Tous canaux confondus', val: dailyGlobalCap, set: setDailyGlobalCap, min: 1, max: 10000, unit: 'msg/jour' },
                { label: 'Quota email par compte', sub: 'Standard Lemlist', val: defaultDailyLimit, set: setDefaultDailyLimit, min: 1, max: 500, unit: 'emails/jour' },
                { label: 'Délai minimum inter-envoi', sub: 'Jitter humain', val: minDelaySec, set: setMinDelaySec, min: 10, max: 600, unit: 'secondes' },
                { label: 'Délai maximum inter-envoi', sub: 'Plafond aléatoire', val: maxDelaySec, set: setMaxDelaySec, min: 10, max: 1200, unit: 'secondes' },
              ].map(({ label, sub, val, set, min, max, unit }) => (
                <div key={label}>
                  <label className="label">{label}</label>
                  <input
                    type="number"
                    value={val}
                    onChange={e => set(Number(e.target.value))}
                    min={min}
                    max={max}
                    className="input"
                  />
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '4px' }}>{sub} · {unit}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 2 — PLAGES HORAIRES                              */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'schedule' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Toggle global vs par canal */}
          <div className="card" style={{ padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Plages horaires différenciées par canal</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '2px' }}>
                  Activé : Email, SMS, RCS et LinkedIn ont chacun leur propre créneau d&apos;envoi
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUsePerChannel(!usePerChannel)}
                style={{ width: '52px', height: '28px', borderRadius: '14px', background: usePerChannel ? '#ffffff' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
              >
                <div style={{ position: 'absolute', top: '5px', left: usePerChannel ? '27px' : '5px', width: '18px', height: '18px', borderRadius: '50%', background: usePerChannel ? '#000' : '#666', transition: 'left 0.2s' }} />
              </button>
            </div>
          </div>

          {/* Plage globale */}
          {!usePerChannel && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Clock size={18} />
                <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Plage d&apos;Envoi Globale</h2>
                <span className="badge" style={{ fontSize: '0.68rem' }}>TOUS CANAUX</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                S&apos;applique à Email, SMS, RCS et LinkedIn simultanément.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '120px 48px 1fr 1fr auto', gap: '12px', padding: '0 14px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Jour</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actif</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Heure de début</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Heure de fin</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Durée</span>
                </div>

                {DAYS.map(day => (
                  <DayRow
                    key={day.key}
                    day={day}
                    slot={globalSchedule[day.key]}
                    onChange={(field, value) => updateGlobalDay(day.key, field, value)}
                  />
                ))}
              </div>

              {/* Résumé hebdo */}
              <div style={{ marginTop: '16px', padding: '12px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginRight: '6px' }}>Jours actifs :</span>
                {DAYS.map(day => {
                  const slot = globalSchedule[day.key];
                  return (
                    <span
                      key={day.key}
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        background: slot.enabled ? '#ffffff' : 'rgba(255,255,255,0.06)',
                        color: slot.enabled ? '#000000' : 'var(--text-subtle)',
                      }}
                    >
                      {day.short}
                      {slot.enabled && ` ${slot.start}-${slot.end}`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Plages par canal */}
          {usePerChannel && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {['email', 'sms', 'rcs', 'linkedin'].map(channel => (
                <div key={channel} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {channelIcons[channel]}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>{channelLabels[channel]}</h3>
                      <p style={{ fontSize: '0.73rem', color: 'var(--text-subtle)', marginTop: '1px' }}>Plage d&apos;envoi spécifique</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                    {DAYS.map(day => (
                      <DayRow
                        key={day.key}
                        day={day}
                        slot={channelSchedules[channel][day.key]}
                        onChange={(field, value) => updateChannelDay(channel, day.key, field, value)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dates de blocage */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Calendar size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Jours de Blocage & Jours Fériés</h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Aucun envoi ne sera déclenché ces jours-là, quel que soit le canal.
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <input
                type="date"
                value={newBlackout}
                onChange={e => setNewBlackout(e.target.value)}
                className="input"
                style={{ flex: 1 }}
              />
              <button onClick={addBlackout} className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                + Ajouter
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {blackoutDates.map(date => (
                <div key={date} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem' }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span>{new Date(date + 'T12:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                  <button onClick={() => setBlackoutDates(blackoutDates.filter(d => d !== date))} style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer', padding: '0 2px', lineHeight: 1, fontSize: '0.9rem' }}>×</button>
                </div>
              ))}
              {blackoutDates.length === 0 && (
                <span style={{ fontSize: '0.82rem', color: 'var(--text-subtle)' }}>Aucun jour de blocage configuré.</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 3 — NOTIFICATIONS                                */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Bell size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Alertes & Notifications</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {[
                { label: 'Nouvelle réponse entrante (Unibox)', sub: 'Notifier dès qu\'un prospect répond à une campagne', val: notifNewReply, set: setNotifNewReply },
                { label: 'Fin d\'une campagne', sub: 'Rapport automatique envoyé à la fin de chaque campagne', val: notifCampaignEnd, set: setNotifCampaignEnd },
                { label: 'Taux de rebond élevé (> 5%)', sub: 'Alerte si les bounces dépassent le seuil critique', val: notifBounce, set: setNotifBounce },
                { label: 'Score de délivrabilité bas (< 60%)', sub: 'Alerte Lemwarm si la réputation de la boîte chute', val: notifLowScore, set: setNotifLowScore },
              ].map(({ label, sub, val, set }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '3px' }}>{sub}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => set(!val)}
                    style={{ width: '44px', height: '24px', borderRadius: '12px', background: val ? '#ffffff' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                  >
                    <div style={{ position: 'absolute', top: '4px', left: val ? '23px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: val ? '#000' : '#666', transition: 'left 0.2s' }} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Email de réception des alertes</label>
                <input type="email" value={notifEmail} onChange={e => setNotifEmail(e.target.value)} className="input" placeholder="danielkiboko218@gmail.com" />
              </div>
              <div>
                <label className="label">Webhook externe (Slack, Make, Zapier…)</label>
                <input type="text" value={notifWebhook} onChange={e => setNotifWebhook(e.target.value)} className="input" placeholder="https://hooks.slack.com/services/..." />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* TAB 4 — SÉCURITÉ & ACCÈS                             */}
      {/* ══════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
              <Shield size={18} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Sécurité & Contrôle d&apos;Accès</h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Double authentification (2FA)', sub: 'Obligatoire pour les comptes Super-Admin', badge: 'RECOMMANDÉ', on: false },
                { label: 'Journal d\'audit des actions', sub: 'Historique complet des modifications et connexions', badge: 'ACTIF', on: true },
                { label: 'Restriction IP (whitelist)', sub: 'Limiter l\'accès à des adresses IP spécifiques', badge: null, on: false },
                { label: 'Déconnexion automatique (30 min)', sub: 'Session expirée après inactivité prolongée', badge: null, on: true },
              ].map(({ label, sub, badge, on: initialOn }) => {
                const [on, setOn] = React.useState(initialOn);
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>
                        {badge && <span className="badge" style={{ fontSize: '0.62rem' }}>{badge}</span>}
                      </div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)', marginTop: '3px' }}>{sub}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOn(!on)}
                      style={{ width: '44px', height: '24px', borderRadius: '12px', background: on ? '#ffffff' : 'rgba(255,255,255,0.12)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}
                    >
                      <div style={{ position: 'absolute', top: '4px', left: on ? '23px' : '4px', width: '16px', height: '16px', borderRadius: '50%', background: on ? '#000' : '#666', transition: 'left 0.2s' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info box */}
          <div style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <Info size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginTop: '1px' }} />
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Les données du CRM sont chiffrées en transit (TLS 1.3) et au repos via Firebase. La gestion avancée des rôles utilisateurs se fait dans le <strong style={{ color: '#ffffff' }}>C-Panel → Agents</strong>.
            </div>
          </div>
        </div>
      )}

      {/* ── Save Banner (fixed) ── */}
      {saved && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          background: '#ffffff',
          color: '#000000',
          borderRadius: 'var(--radius-md)',
          fontWeight: 700,
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          zIndex: 9999,
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 size={18} />
          Paramètres enregistrés avec succès !
        </div>
      )}
    </div>
  );
}
