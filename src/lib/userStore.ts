import { User, SaasPricingConfig } from '@/types';

// Emails SuperAdmin lus depuis les variables d'environnement
// Format : "email1@domaine.com,email2@domaine.com"
const getSuperAdminEmails = (): string[] => {
  const envEmails = process.env.NEXT_PUBLIC_SUPERADMIN_EMAILS || '';
  return envEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
};

export const DEFAULT_SAAS_PRICING: SaasPricingConfig = {
  baseEmailPrice: 30, // 30 $/mois pour Cold Email Marketing Lemlist standard
  smsUnitPrice: 0.036, // 0.036 $ / SMS
  smsPackPrice1000: 36, // 36 $ / 1000 SMS
  rcsUnitPrice: 0.040, // 0.040 $ / message RCS Google
  rcsPackPrice1000: 40, // 40 $ / 1000 RCS
  linkedinMonthlyPrice: 25 // 25 $/mois automatisation B2B
};

const SAAS_PRICING_STORAGE_KEY = 'crm_rayons_saas_pricing_v1';

export function getSaasPricing(): SaasPricingConfig {
  if (typeof window === 'undefined') return DEFAULT_SAAS_PRICING;
  try {
    const data = localStorage.getItem(SAAS_PRICING_STORAGE_KEY);
    if (!data) return DEFAULT_SAAS_PRICING;
    return { ...DEFAULT_SAAS_PRICING, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SAAS_PRICING;
  }
}

export function saveSaasPricing(pricing: SaasPricingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAAS_PRICING_STORAGE_KEY, JSON.stringify(pricing));
  } catch (err) {
    console.error('Error saving SaaS pricing', err);
  }
}

export const INITIAL_SAAS_USERS: User[] = [
  {
    id: 'user-superadmin-daniel',
    name: 'Daniel Kiboko',
    email: 'danielkiboko218@gmail.com',
    role: 'superadmin',
    companyName: 'CRM Rayons',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    subscriptionPlan: 'lifetime',
    subscriptionPrice: 30,
    subscriptionStatus: 'pro_active',
    trialEndsAt: undefined,
    smppCredits: 100000,
    rcsCredits: 50000,
    dailyEmailLimit: 1000,
    hasSmsUpgrade: true,
    hasRcsUpgrade: true,
    hasLinkedinUpgrade: true
  }
];

const SAAS_USERS_STORAGE_KEY = 'crm_rayons_users_production_v1';

export function getSaasUsers(): User[] {
  if (typeof window === 'undefined') return INITIAL_SAAS_USERS;
  try {
    const data = localStorage.getItem(SAAS_USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SAAS_USERS_STORAGE_KEY, JSON.stringify(INITIAL_SAAS_USERS));
      return INITIAL_SAAS_USERS;
    }
    const parsed: User[] = JSON.parse(data);
    // Ensure Super-Admin is always present
    const superAdminEmails = getSuperAdminEmails();
    const hasSuperAdmin = parsed.some(
      u => superAdminEmails.includes(u.email.toLowerCase())
    );
    if (!hasSuperAdmin) {
      const updated = [INITIAL_SAAS_USERS[0], ...parsed];
      localStorage.setItem(SAAS_USERS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading SaaS users', err);
    return INITIAL_SAAS_USERS;
  }
}

export function saveSaasUsers(users: User[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SAAS_USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving SaaS users', err);
  }
}

export function addSaasUser(user: User): User[] {
  const users = getSaasUsers();
  const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  let updated: User[];
  if (existingIndex >= 0) {
    updated = users.map((u, i) => i === existingIndex ? { ...u, ...user } : u);
  } else {
    updated = [user, ...users];
  }
  saveSaasUsers(updated);
  return updated;
}

export function updateSaasUser(userId: string, updates: Partial<User>): User[] {
  const users = getSaasUsers();
  const updated = users.map(u => u.id === userId ? { ...u, ...updates } : u);
  saveSaasUsers(updated);
  return updated;
}

export function deleteSaasUser(userId: string): User[] {
  const users = getSaasUsers();
  const updated = users.filter(u => u.id !== userId);
  saveSaasUsers(updated);
  return updated;
}

export function toggleUserUpgrade(
  userId: string,
  upgrade: 'sms' | 'rcs' | 'linkedin',
  enabled: boolean,
  initialCredits?: number
): User[] {
  const users = getSaasUsers();
  const updated = users.map(u => {
    if (u.id !== userId) return u;
    if (upgrade === 'sms') {
      return {
        ...u,
        hasSmsUpgrade: enabled,
        smppCredits: enabled ? (u.smppCredits ?? 0) + (initialCredits ?? 1000) : u.smppCredits
      };
    }
    if (upgrade === 'rcs') {
      return {
        ...u,
        hasRcsUpgrade: enabled,
        rcsCredits: enabled ? (u.rcsCredits ?? 0) + (initialCredits ?? 1000) : u.rcsCredits
      };
    }
    if (upgrade === 'linkedin') {
      return {
        ...u,
        hasLinkedinUpgrade: enabled
      };
    }
    return u;
  });
  saveSaasUsers(updated);
  return updated;
}

export function addUserCredits(
  userId: string,
  channel: 'sms' | 'rcs',
  count: number
): User[] {
  const users = getSaasUsers();
  const updated = users.map(u => {
    if (u.id !== userId) return u;
    if (channel === 'sms') {
      return { ...u, hasSmsUpgrade: true, smppCredits: (u.smppCredits || 0) + count };
    }
    if (channel === 'rcs') {
      return { ...u, hasRcsUpgrade: true, rcsCredits: (u.rcsCredits || 0) + count };
    }
    return u;
  });
  saveSaasUsers(updated);
  return updated;
}

/**
 * Retourne true si l'email est celui d'un SuperAdmin CRM Rayons.
 * La source de vérité est la variable d'env NEXT_PUBLIC_SUPERADMIN_EMAILS
 * ou le rôle 'superadmin' en base.
 */
export function isSuperAdminEmail(email?: string): boolean {
  if (!email) return false;
  const clean = email.trim().toLowerCase();
  const superAdminEmails = getSuperAdminEmails();
  return (
    superAdminEmails.includes(clean) ||
    clean === 'danielkiboko218@gmail.com' ||
    clean === 'crm@rayons.net' ||
    clean === 'daniel.kiboko@rayons.net'
  );
}

/**
 * Calcule le statut d'abonnement/trial d'un utilisateur CRM Rayons.
 */
export function checkUserTrialStatus(user: User | null): {
  isSuperAdmin: boolean;
  isProActive: boolean;
  isTrialActive: boolean;
  isExpired: boolean;
  daysRemaining: number;
} {
  if (!user) {
    return { isSuperAdmin: false, isProActive: false, isTrialActive: false, isExpired: true, daysRemaining: 0 };
  }

  // Super Admin is never blocked — détection via env var ou rôle
  if (user.role === 'superadmin' || isSuperAdminEmail(user.email)) {
    return { isSuperAdmin: true, isProActive: true, isTrialActive: false, isExpired: false, daysRemaining: 999 };
  }

  // Active Pro subscription (30$/month)
  if (user.subscriptionStatus === 'pro_active' || user.subscriptionPlan === 'pro_monthly' || user.subscriptionPlan === 'lifetime') {
    return { isSuperAdmin: false, isProActive: true, isTrialActive: false, isExpired: false, daysRemaining: 30 };
  }

  // Check trial end date (7 days trial)
  if (!user.trialEndsAt) {
    const created = new Date(user.createdAt).getTime();
    const trialEnd = created + 7 * 24 * 60 * 60 * 1000;
    const diff = trialEnd - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return {
      isSuperAdmin: false,
      isProActive: false,
      isTrialActive: days > 0,
      isExpired: days <= 0,
      daysRemaining: Math.max(0, days)
    };
  }

  const trialEnd = new Date(user.trialEndsAt).getTime();
  const diff = trialEnd - Date.now();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  return {
    isSuperAdmin: false,
    isProActive: false,
    isTrialActive: days > 0,
    isExpired: days <= 0,
    daysRemaining: Math.max(0, days)
  };
}
