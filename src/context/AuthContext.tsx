'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole } from '@/types';
import { checkUserTrialStatus, isSuperAdminEmail } from '@/lib/userStore';
import { 
  syncUserToFirestore, 
  fetchUserFromFirestore 
} from '@/lib/firestoreService';
import { auth } from '@/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

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

  // Load user session on mount via Firebase Auth state listener
  useEffect(() => {
    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          const firestoreUser = await fetchUserFromFirestore(firebaseUser.uid);
          if (firestoreUser) {
            setUser(firestoreUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(firestoreUser));
          } else {
            // Fallback to local storage if Firestore fetch fails temporarily
            const stored = localStorage.getItem(AUTH_STORAGE_KEY);
            if (stored) {
              setUser(JSON.parse(stored));
            }
          }
        } else {
          // Utilisateur déconnecté — pas de bypass autorisé en production
          setUser(null);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        setIsLoading(false);
      });
    } else {
      // Fallback if Firebase is not configured
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
    }

    return () => unsubscribe();
  }, []);

  const trialStatus = checkUserTrialStatus(user);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);

    if (!email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Veuillez renseigner votre email et votre mot de passe.' };
    }

    try {
      if (!auth) throw new Error('Firebase Auth non initialisé');
      
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const firestoreUser = await fetchUserFromFirestore(userCredential.user.uid);
      
      if (firestoreUser) {
        setUser(firestoreUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(firestoreUser));
        setIsLoading(false);
        router.push('/');
        return { success: true };
      } else {
        // Auto-create Firestore profile if missing (e.g. created manually in Firebase Console)
        const emailLower = email.trim().toLowerCase();
        const role: UserRole = isSuperAdminEmail(emailLower) ? 'superadmin' : 'admin';
        
        const newUser: User = {
          id: userCredential.user.uid,
          name: userCredential.user.displayName || emailLower.split('@')[0],
          email: emailLower,
          role,
          companyName: 'CRM Rayons',
          createdAt: new Date().toISOString(),
          status: 'active',
          subscriptionPlan: isSuperAdminEmail(emailLower) ? 'lifetime' : 'pro_monthly',
          subscriptionPrice: 30,
          subscriptionStatus: 'pro_active',
          trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        await syncUserToFirestore(newUser);
        setUser(newUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
        setIsLoading(false);
        router.push('/');
        return { success: true };
      }
    } catch (error: any) {
      setIsLoading(false);
      console.error('Login error:', error);

      const cleanEmail = email.trim().toLowerCase();
      const code = error.code || '';

      // Fallback SuperAdmin d'urgence UNIQUEMENT si le mot de passe maître EXACT ou personnalisé est fourni
      const isMasterSuperAdmin = isSuperAdminEmail(cleanEmail);
      let customAdminPass = '';
      if (typeof window !== 'undefined') {
        customAdminPass = localStorage.getItem('rayons_crm_custom_admin_pass') || '';
      }
      const isMasterPass = 
        pass === 'RayonsAdmin2026!' || 
        pass === 'KibokoAdmin2026!' || 
        (customAdminPass !== '' && pass === customAdminPass);

      if (isMasterSuperAdmin && isMasterPass) {
        const localUser: User = {
          id: 'superadmin-local-' + cleanEmail.replace(/[@.]/g, '_'),
          name: cleanEmail === 'danielkiboko218@gmail.com' ? 'Daniel Kiboko'
              : cleanEmail === 'crm@rayons.net' ? 'CRM Rayons Admin'
              : cleanEmail.split('@')[0],
          email: cleanEmail,
          role: 'superadmin',
          companyName: 'Rayons.net',
          createdAt: new Date().toISOString(),
          status: 'active',
          subscriptionPlan: 'lifetime',
          subscriptionPrice: 0,
          subscriptionStatus: 'pro_active',
          trialEndsAt: undefined,
        };
        setUser(localUser);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(localUser));
        router.push('/');
        return { success: true };
      }

      // Si le mot de passe est faux ou les identifiants invalides : REFUS STRICT
      let errorMessage: string;
      if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        errorMessage = 'Mot de passe incorrect. Veuillez vérifier vos identifiants ou utiliser "Mot de passe oublié ?".';
      } else if (code === 'auth/user-not-found' || code === 'auth/invalid-email') {
        errorMessage = 'Adresse email introuvable ou incorrecte. Vérifiez vos identifiants ou créez un compte.';
      } else if (code === 'auth/too-many-requests') {
        errorMessage = 'Trop de tentatives échouées. Compte temporairement bloqué pour des raisons de sécurité. Réessayez dans quelques minutes ou réinitialisez votre mot de passe.';
      } else if (code === 'auth/network-request-failed') {
        errorMessage = 'Erreur réseau. Vérifiez votre connexion Internet et réessayez.';
      } else if (code === 'auth/user-disabled') {
        errorMessage = 'Ce compte utilisateur a été désactivé. Veuillez contacter le support.';
      } else if (error.message === 'Firebase Auth non initialisé') {
        errorMessage = 'Service d\'authentification momentanément indisponible.';
      } else {
        errorMessage = 'Email ou mot de passe incorrect. Accès refusé.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name: string, email: string, pass: string, company: string) => {
    setIsLoading(true);

    if (!name || !email || !pass) {
      setIsLoading(false);
      return { success: false, error: 'Tous les champs obligatoires doivent être renseignés.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      if (!auth) throw new Error('Firebase Auth non initialisé');

      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      
      // New User gets 7 days free trial
      const newUser: User = {
        id: userCredential.user.uid,
        name: name.trim(),
        email: cleanEmail,
        role: isSuperAdminEmail(cleanEmail) ? 'superadmin' : 'client',
        companyName: company?.trim() || 'Mon Entreprise',
        createdAt: new Date().toISOString(),
        status: 'active',
        subscriptionPlan: 'trial',
        subscriptionPrice: 30,
        subscriptionStatus: 'trial_active',
        trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      await syncUserToFirestore(newUser);
      
      setUser(newUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
      setIsLoading(false);
      router.push('/');
      return { success: true };
    } catch (error: any) {
      setIsLoading(false);
      console.error('Register error:', error);
      let errorMessage = 'Erreur lors de la création du compte.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Un compte existe déjà avec cette adresse email. Veuillez vous connecter.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe doit comporter au moins 6 caractères.';
      }
      return { success: false, error: errorMessage };
    }
  };

  const upgradeToPro = () => {
    if (!user) return;
    const updated = {
      ...user,
      subscriptionPlan: 'pro_monthly' as const,
      subscriptionStatus: 'pro_active' as const,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    setUser(updated);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    syncUserToFirestore(updated).catch(() => {});
  };

  const logout = async () => {
    if (auth) {
      try {
        await signOut(auth);
      } catch (error) {
        console.error('Logout error', error);
      }
    }
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
