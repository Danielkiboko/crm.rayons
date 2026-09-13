import { User } from '@/types';

export const INITIAL_SAAS_USERS: User[] = [
  {
    id: 'user-superadmin-daniel',
    name: 'Daniel Kiboko',
    email: 'danielkiboko218@gmail.com',
    password: 'RayonsAdmin2026!',
    role: 'superadmin',
    companyName: 'Rayons.net',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    subscriptionPlan: 'lifetime',
    subscriptionPrice: 30,
    subscriptionStatus: 'pro_active',
    trialEndsAt: undefined
  },
  {
    id: 'user-demo-marc',
    name: 'Marc Fontaine',
    email: 'marc.fontaine@techgrowth.fr',
    password: 'Marc2026!',
    role: 'admin',
    companyName: 'TechGrowth Studio',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    subscriptionPlan: 'trial',
    subscriptionPrice: 30,
    subscriptionStatus: 'trial_active',
    trialEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-demo-elodie',
    name: 'Élodie Lambert',
    email: 'elodie@agence-scale.com',
    password: 'Elodie2026!',
    role: 'admin',
    companyName: 'Agence Scale B2B',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    subscriptionPlan: 'pro_monthly',
    subscriptionPrice: 30,
    subscriptionStatus: 'pro_active',
    trialEndsAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    subscriptionExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'user-demo-julien',
    name: 'Julien Perrot',
    email: 'julien@perrot-conseil.fr',
    password: 'Julien2026!',
    role: 'admin',
    companyName: 'Perrot Conseil',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    subscriptionPlan: 'trial',
    subscriptionPrice: 30,
    subscriptionStatus: 'expired',
    trialEndsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const SAAS_USERS_STORAGE_KEY = 'rayons_saas_crm_users_db_v2';

export function getSaasUsers(): User[] {
  if (typeof window === 'undefined') return INITIAL_SAAS_USERS;
  try {
    const data = localStorage.getItem(SAAS_USERS_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(SAAS_USERS_STORAGE_KEY, JSON.stringify(INITIAL_SAAS_USERS));
      return INITIAL_SAAS_USERS;
    }
    const parsed: User[] = JSON.parse(data);
    // Ensure Super-Admin is always present and updated
    const hasSuperAdmin = parsed.some(u => u.email.toLowerCase() === 'crm@rayons.net');
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

export function isEmailRegistered(email: string): boolean {
  const clean = email.trim().toLowerCase();
  const users = getSaasUsers();
  return users.some(u => u.email.toLowerCase() === clean);
}

export function findUserByEmail(email: string): User | undefined {
  const clean = email.trim().toLowerCase();
  const users = getSaasUsers();
  return users.find(u => u.email.toLowerCase() === clean);
}

export function verifyUserCredentials(email: string, pass: string): { success: boolean; user?: User; error?: string } {
  const clean = email.trim().toLowerCase();

  // 1. Super-Admin Master Account (Daniel Kiboko)
  if (
    clean === 'danielkiboko218@gmail.com' ||
    clean === 'crm@rayons.net' || 
    clean === 'daniel.kiboko@rayons.net' || 
    clean === 'daniel@rayons.net'
  ) {
    const validSuperAdminPasswords = ['RayonsAdmin2026!', 'KibokoAdmin2026!'];
    if (validSuperAdminPasswords.includes(pass)) {
      const superAdminUser: User = {
        id: 'user-superadmin-daniel',
        name: 'Daniel Kiboko',
        email: 'danielkiboko218@gmail.com',
        role: 'superadmin',
        companyName: 'Rayons.net',
        createdAt: '2026-01-01T00:00:00Z',
        status: 'active',
        subscriptionPlan: 'lifetime',
        subscriptionPrice: 30,
        subscriptionStatus: 'pro_active'
      };
      return { success: true, user: superAdminUser };
    } else {
      return { success: false, error: 'Mot de passe Super-Admin incorrect. Accès refusé.' };
    }
  }

  // 2. Client Account Search
  const user = findUserByEmail(clean);
  if (!user) {
    return { success: false, error: 'Aucun compte n\'existe avec cet e-mail. Veuillez créer un compte avec l\'essai 7 jours.' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Votre compte a été suspendu par l\'administrateur. Veuillez contacter crm@rayons.net.' };
  }

  // Strict Password Verification
  if (!user.password || user.password !== pass) {
    return { success: false, error: 'Mot de passe incorrect. Veuillez vérifier vos identifiants.' };
  }

  return { success: true, user };
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

/**
 * Check if a user trial is valid or expired
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

  // Super Admin is never blocked
  if (user.role === 'superadmin' || user.email === 'danielkiboko218@gmail.com' || user.email === 'crm@rayons.net' || user.email === 'daniel.kiboko@rayons.net') {
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
