'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/types';
import { 
  checkUserTrialStatus, 
  getSaasUsers, 
  addSaasUser, 
  updateSaasUser, 
  verifyUserCredentials, 
  isEmailRegistered 
} from '@/lib/userStore';
import { 
  syncUserToFirestore, 
  fetchUserByEmailFromFirestore 
} from '@/lib/firestoreService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  trialStatus: {
    isSuperAdmin: boolean;
    isProActive: boolean;
    isTrialActive: boolean;
    isExpired: boolean;
    daysRemaining: number;
  };
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, company: string) => Promise<{ success: boolean; error?: string }>;
  upgradeToPro: () => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'rayons_crm_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Load user session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        // Refresh with current database state if available
        const allUsers = getSaasUsers();
        const fresh = allUsers.find(u => u.id === parsed.id || u.email.toLowerCase() === parsed.email.toLowerCase());
        setUser(fresh || parsed);
      }
    } catch (e) {
      console.error('Failed to read auth session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trialStatus = checkUserTrialStatus(user);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Veuillez renseigner votre email et votre mot de passe.' };
    }

    // Strict credential verification against the autonomous user store
    const verification = verifyUserCredentials(email, pass);
    if (!verification.success || !verification.user) {
      setIsLoading(false);
      return { success: false, error: verification.error || 'Identifiants invalides.' };
    }

    const loggedUser = verification.user;
    setUser(loggedUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedUser));
    syncUserToFirestore(loggedUser).catch(() => {});
    setIsLoading(false);
    router.push('/');
    return { success: true };
  };

  const register = async (name: string, email: string, pass: string, company: string) => {
    setIsLoading(true);

    if (!name || !email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Tous les champs obligatoires doivent être renseignés.' };
    }

    const cleanEmail = email.trim().toLowerCase();
    
    // Check if email already has an account
    if (isEmailRegistered(cleanEmail)) {
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter avec votre mot de passe.' 
      };
    }

    // New User gets 7 days free trial
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      password: pass,
      role: cleanEmail === 'crm@rayons.net' ? 'superadmin' : 'admin',
      companyName: company?.trim() || 'Mon Entreprise',
      createdAt: new Date().toISOString(),
      status: 'active',
      subscriptionPlan: 'trial',
      subscriptionPrice: 30,
      subscriptionStatus: 'trial_active',
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };

    addSaasUser(newUser);
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    syncUserToFirestore(newUser).catch(() => {});
    setIsLoading(false);
    router.push('/');
    return { success: true };
  };

  const upgradeToPro = () => {
    if (!user) return;
    const updated = {
      ...user,
      subscriptionPlan: 'pro_monthly' as const,
      subscriptionStatus: 'pro_active' as const,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    updateSaasUser(user.id, updated);
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    syncUserToFirestore(updated).catch(() => {});
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        trialStatus,
        login,
        register,
        upgradeToPro,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
