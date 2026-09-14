import { User } from '@/types';

export const INITIAL_SAAS_USERS: User[] = [
  {
    id: 'user-superadmin-daniel',
    name: 'Daniel Kiboko',
    email: 'danielkiboko218@gmail.com',
    password: 'RayonsAdmin2026!',
    role: 'superadmin',
    companyName: 'CRM Rayons',
    createdAt: '2026-01-01T00:00:00Z',
    status: 'active',
    subscriptionPlan: 'lifetime',
    subscriptionPrice: 30,
    subscriptionStatus: 'pro_active',
    trialEndsAt: undefined,
    smppCredits: 100000,
    dailyEmailLimit: 1000
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
    const hasSuperAdmin = parsed.some(
      u => u.email.toLowerCase() === 'danielkiboko218@gmail.com' || u.email.toLowerCase() === 'crm@rayons.net'
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
  const user = findUserByEmail(clean);

  if (!user) {
    return { success: false, error: 'Aucun compte n\'existe avec cet e-mail dans la base de données. Veuillez vous inscrire via l\'essai 7 jours.' };
  }

  if (user.status === 'suspended') {
    return { success: false, error: 'Votre compte a été suspendu par l\'administrateur. Veuillez contacter crm@rayons.net.' };
  }

  // Strict verification against database stored password
  if (!user.password || user.password !== pass) {
    return { success: false, error: 'Mot de passe incorrect. Veuillez vérifier vos identifiants ou réinitialiser votre mot de passe.' };
  }

  return { success: true, user };
}

export function updateUserPassword(email: string, newPassword: string): boolean {
  const clean = email.trim().toLowerCase();
  const users = getSaasUsers();
  const user = users.find(u => u.email.toLowerCase() === clean);
  if (!user) return false;

  user.password = newPassword;
  saveSaasUsers(users);
  return true;
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
