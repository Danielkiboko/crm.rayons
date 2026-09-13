export type ChannelType = 'email' | 'linkedin' | 'call' | 'task';

export type UserRole = 'superadmin' | 'admin' | 'sales' | 'viewer';

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
}

export type StepActionType = 
  | 'email_send'
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
  linkedInNote?: string;
  personalizedImageUrl?: string;
  enableABTesting?: boolean;
  subjectB?: string;
  bodyB?: string;
  conditionCriteria?: 'opened' | 'clicked' | 'replied' | 'linkedin_connected';
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
  tags: string[];
  createdAt: string;
  lastActivity?: string;
  emailVerified: boolean;
  emailStatus?: 'valid' | 'risky' | 'invalid' | 'unverified';
  emailVerificationReason?: string;
  score: number;
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
  channel: 'email' | 'linkedin';
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
}

