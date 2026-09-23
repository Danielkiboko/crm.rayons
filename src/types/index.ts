export type ChannelType = 'email' | 'linkedin' | 'sms' | 'rcs' | 'call' | 'task';

export type UserRole = 'superadmin' | 'admin' | 'client' | 'sales' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatar?: string;
  companyName: string;
  createdAt: string;
  status?: 'active' | 'suspended';
  subscriptionPlan?: 'trial' | 'pro_monthly' | 'lifetime';
  subscriptionPrice?: number; // 30
  subscriptionStatus?: 'trial_active' | 'pro_active' | 'expired' | 'cancelled';
  trialEndsAt?: string; // ISO string 7 days from creation
  subscriptionExpiresAt?: string;
  lastLogin?: string;
  smppCredits?: number; // Crédits SMS / SMPP disponibles
  rcsCredits?: number; // Crédits Google RCS disponibles
  dailyEmailLimit?: number; // Limite journalière standard Lemlist
  // Upgrades / Options payantes supplémentaires
  hasSmsUpgrade?: boolean; // Option SMS activée
  hasRcsUpgrade?: boolean; // Option RCS activée
  hasLinkedinUpgrade?: boolean; // Option LinkedIn activée
}

export interface SaasPricingConfig {
  baseEmailPrice: number; // 30 ($/mois pour Email Marketing de base)
  smsUnitPrice: number; // 0.036 ($/SMS)
  smsPackPrice1000: number; // 36 ($/pack de 1000 SMS)
  rcsUnitPrice: number; // 0.040 ($/message RCS)
  rcsPackPrice1000: number; // 40 ($/pack de 1000 RCS)
  linkedinMonthlyPrice: number; // 25 ($/mois pour automatisation LinkedIn)
}

export type StepActionType = 
  | 'email_send'
  | 'sms_send'
  | 'rcs_send'
  | 'linkedin_visit'
  | 'linkedin_connect'
  | 'linkedin_message'
  | 'linkedin_voice'
  | 'delay'
  | 'condition';

export interface CampaignStep {
  id: string;
  order: number;
  type: StepActionType;
  channel: ChannelType;
  title: string;
  delayDays: number;
  delayHours: number;
  subject?: string;
  body?: string;
  smsBody?: string;
  rcsTitle?: string;
  rcsBody?: string;
  rcsMediaUrl?: string;
  rcsSuggestions?: { type: 'reply' | 'url' | 'call'; text: string; data?: string; url?: string; phone?: string }[];
  linkedInNote?: string;
  personalizedImageUrl?: string;
  enableABTesting?: boolean;
  subjectB?: string;
  bodyB?: string;
  conditionCriteria?: 'opened' | 'clicked' | 'replied' | 'linkedin_connected';
  senderId?: string; // Expéditeur SMS/RCS alphanumérique (ex: RAYONS)
  autoCleanGsm?: boolean; // Nettoyage automatique des caractères spéciaux en GSM-7
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  jobTitle: string;
  linkedinUrl?: string;
  phone?: string;
  website?: string;
  status: 'new' | 'in_progress' | 'replied' | 'converted' | 'bounced' | 'unsubscribed';
  sentiment?: 'interested' | 'not_interested' | 'meeting_booked' | 'out_of_office' | 'neutral';
  customVariables?: Record<string, string>;
  campaignId?: string;
  currentStepIndex?: number;
  icebreaker?: string; // AI generated personalized message
  tags: string[];
  createdAt: string;
  lastActivity?: string;
  emailVerified: boolean;
  emailStatus?: 'valid' | 'risky' | 'invalid' | 'unverified';
  emailVerificationReason?: string;
  score: number;
  deliveryStatus?: 'delivered' | 'failed' | 'bounced' | 'pending' | 'opened' | 'replied';
  deliveryError?: string;
  deliveryDate?: string;
}

export interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  createdAt: string;
  steps: CampaignStep[];
  leadsCount: number;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
  repliedCount: number;
  interestedCount: number;
  bounceCount: number;
  senderAccounts: string[];
  dailyLimit: number;
  timezone: string;
  scheduleDays: number[]; // 1 = Monday, 5 = Friday
  scheduleStartTime: string; // '09:00'
  scheduleEndTime: string; // '18:00'
}

export interface WarmupConfig {
  mailboxEmail: string;
  provider: 'google' | 'microsoft' | 'smtp';
  active: boolean;
  currentScore: number;
  dailyWarmupSent: number;
  dailyWarmupTarget: number;
  rampUpSpeed: 'slow' | 'balanced' | 'fast';
  spfStatus: 'pass' | 'warning' | 'fail';
  dkimStatus: 'pass' | 'warning' | 'fail';
  dmarcStatus: 'pass' | 'warning' | 'fail';
  mxStatus: 'pass' | 'fail';
  inboxPlacementRate: number; // 0-100%
  spamRate: number;
  promoRate: number;
  daysActive: number;
}

export interface UniboxMessage {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadCompany: string;
  leadAvatar?: string;
  channel: 'email' | 'linkedin' | 'sms' | 'rcs';
  direction: 'inbound' | 'outbound';
  subject?: string;
  snippet: string;
  content: string;
  timestamp: string;
  read: boolean;
  sentiment: 'interested' | 'not_interested' | 'meeting_booked' | 'out_of_office' | 'neutral';
  campaignId?: string;
  campaignName?: string;
}

export interface Deal {
  id: string;
  title: string;
  leadId: string;
  leadName: string;
  company: string;
  value: number;
  stage: 'lead' | 'qualified' | 'demo_booked' | 'negotiation' | 'won' | 'lost';
  assignedTo: string;
  createdAt: string;
  expectedCloseDate: string;
}

export interface ImageTemplate {
  id: string;
  title: string;
  category: 'coffee' | 'laptop' | 'whiteboard' | 'billboard' | 'certificate';
  thumbnailUrl: string;
  backgroundUrl: string;
  defaultText: string;
  textPosition: { x: number; y: number; fontSize: number; color: string; rotation?: number; maxWidth?: number };
  showCompanyLogo?: boolean;
  logoPosition?: { x: number; y: number; width: number; height: number };
}

export interface EmailAccount {
  id: string;
  name: string;
  email: string;
  provider: 'hostinger' | 'google' | 'microsoft' | 'custom';
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  imapHost?: string;
  imapPort?: number;
  imapSecure?: boolean;
  imapUser?: string;
  imapPass?: string;
  status: 'connected' | 'error' | 'untested';
  lastTested?: string;
  errorMessage?: string;
  isDefault: boolean;
  createdAt: string;
  // Lemlist Standard Deliverability & Configuration
  dailyLimit?: number; // Quota journalier d'envoi (Lemlist: 40-50 max)
  minDelaySeconds?: number; // Délai min entre deux envois (Lemlist: 60s)
  maxDelaySeconds?: number; // Délai max avec jitter humain (Lemlist: 180s)
  customTrackingDomain?: string; // ex: 'track.rayons.net'
  plainTextMode?: boolean; // Mode texte brut recommandé pour éviter l'onglet Spam/Promo
  warmupEnabled?: boolean; // Activation de la chauffe Lemwarm
  warmupScore?: number; // Score de santé délivrabilité 0-100%
  signature?: string; // Signature avec mention anti-spam légale
  scheduleDays?: number[]; // [1, 2, 3, 4, 5] (Lundi à Vendredi)
  scheduleStartTime?: string; // '08:30'
  scheduleEndTime?: string; // '18:00'
  dnsStatus?: {
    spf: 'pass' | 'warning' | 'fail';
    dkim: 'pass' | 'warning' | 'fail';
    dmarc: 'pass' | 'warning' | 'fail';
    mx: 'pass' | 'fail';
  };
}

export interface TelecomRouteConfig {
  id: string;
  name: string; // ex: 'Orange Direct SMSC', 'Vodacom Telecom Gateway', 'Google RBM Cloud'
  channel: 'sms' | 'rcs';
  endpointUrl: string;
  authType: 'bearer' | 'basic' | 'apiKey' | 'header';
  apiToken?: string;
  apiSecret?: string;
  senderId: string; // ex: 'RAYONS', 'LEMFLOW'
  rcsBotId?: string; // ex: 'rayons-bot@rbm.goog'
  status: 'active' | 'testing' | 'inactive';
  tpsLimit?: number; // Débit max en messages/seconde
  webhookUrl?: string;
  createdAt: string;
}

export interface LinkedinAccount {
  id: string;
  name: string;
  headline?: string;
  avatarUrl?: string;
  profileUrl: string;
  email?: string;
  cookieLiAt?: string;
  connectedAt: string;
  dailyLimit: number;
  status: 'connected' | 'disconnected' | 'untested';
  connectMethod: 'oneclick' | 'credentials' | 'cookie';
}

