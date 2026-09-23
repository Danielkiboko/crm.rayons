import { Campaign, Lead, UniboxMessage, Deal, WarmupConfig, ImageTemplate, EmailAccount } from '@/types';

export const INITIAL_IMAGE_TEMPLATES: ImageTemplate[] = [];

// Production prête : Aucune donnée fictive ou prospect d'exemple
export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_CAMPAIGNS: Campaign[] = [];

export const INITIAL_WARMUP_CONFIG: WarmupConfig = {
  mailboxEmail: '',
  provider: 'smtp',
  active: false,
  currentScore: 100,
  dailyWarmupSent: 0,
  dailyWarmupTarget: 40,
  rampUpSpeed: 'balanced',
  spfStatus: 'pass',
  dkimStatus: 'pass',
  dmarcStatus: 'pass',
  mxStatus: 'pass',
  inboxPlacementRate: 100,
  spamRate: 0,
  promoRate: 0,
  daysActive: 0
};

export const INITIAL_UNIBOX_MESSAGES: UniboxMessage[] = [];

export const INITIAL_DEALS: Deal[] = [];

export const INITIAL_EMAIL_ACCOUNTS: EmailAccount[] = [];

// Helper functions for client-side persistence and dynamic updates
const STORAGE_KEYS = {
  CAMPAIGNS: 'lemlist_crm_campaigns',
  LEADS: 'lemlist_crm_leads',
  UNIBOX: 'lemlist_crm_unibox',
  DEALS: 'lemlist_crm_deals',
  WARMUP: 'lemlist_crm_warmup',
  TEMPLATES: 'lemlist_crm_templates',
  EMAIL_ACCOUNTS: 'lemlist_crm_email_accounts'
};

export function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}
