'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string, company: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: 'admin' | 'sales') => void;
  logout: () => void;
}

const DEMO_USERS: Record<string, User> = {
  admin: {
    id: 'user-admin-1',
    name: 'Daniel Kiboko',
    email: 'daniel.kiboko@lemflow.io',
    role: 'admin',
    companyName: 'LemFlow SaaS',
    createdAt: '2026-01-10T08:00:00Z'
  },
  sales: {
    id: 'user-sales-1',
    name: 'Sarah Laurent',
    email: 'sarah.laurent@lemflow.io',
    role: 'sales',
    companyName: 'LemFlow SaaS',
    createdAt: '2026-03-15T09:00:00Z'
  }
};

const AUTH_STORAGE_KEY = 'lemflow_auth_session';

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
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to read auth session from storage', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Veuillez saisir votre email et votre mot de passe.' };
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setIsLoading(false);
        return { 
          success: false, 
          error: data.error || 'Accès refusé. Vos identifiants ne sont pas autorisés.' 
        };
      }

      setUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      setIsLoading(false);
      router.push('/');
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setIsLoading(false);
      return { 
        success: false, 
        error: 'Erreur de connexion au serveur d\'authentification central rayons.net.' 
      };
    }
  };

  const register = async (name: string, email: string, pass: string, company: string) => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 500));

    if (!name || !email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Tous les champs obligatoires doivent être remplis.' };
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role: 'admin',
      companyName: company || 'Mon Entreprise',
      createdAt: new Date().toISOString()
    };

    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    router.push('/');
    return { success: true };
  };

  const loginAsDemo = (role: 'admin' | 'sales') => {
    const demo = DEMO_USERS[role];
    setUser(demo);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(demo));
    router.push('/');
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
        login,
        register,
        loginAsDemo,
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
