/**
 * Module d'Administration Centrale (cPanel Rayons)
 * 
 * Ce service regroupe toutes les opérations Super-Admin :
 * - Gestion des comptes clients et permissions
 * - Supervision des abonnements, licences et limites
 * - Configuration des passerelles Télécom (SMPP, RCS, SMS)
 * - Diagnostics d'infrastructure et clés d'API
 */

import { User, SaasPricingConfig } from '@/types';
import { 
  getSaasUsers, 
  saveSaasUsers, 
  addSaasUser, 
  updateSaasUser, 
  deleteSaasUser,
  getSaasPricing,
  saveSaasPricing,
  toggleUserUpgrade,
  addUserCredits,
  checkUserTrialStatus,
  isSuperAdminEmail
} from '@/lib/userStore';
import { 
  fetchAllUsersFromFirestore, 
  syncUserToFirestore, 
  deleteUserFromFirestore 
} from '@/lib/firestoreService';
import { 
  fetchUsersFromSupabase, 
  syncUserToSupabase, 
  deleteUserFromSupabase 
} from '@/lib/supabaseService';

export const CpanelService = {
  // --- GESTION DES UTILISATEURS / CLIENTS ---
  async getAllClients(): Promise<User[]> {
    try {
      // 1. Essayer de charger depuis Supabase
      const supabaseUsers = await fetchUsersFromSupabase();
      if (supabaseUsers && supabaseUsers.length > 0) {
        return supabaseUsers;
      }
      // 2. Sinon Firestore
      const firestoreUsers = await fetchAllUsersFromFirestore();
      if (firestoreUsers && firestoreUsers.length > 0) {
        return firestoreUsers;
      }
    } catch (err) {
      console.warn('Fallback local users in CpanelService:', err);
    }
    // 3. Fallback LocalStore
    return getSaasUsers();
  },

  async saveClient(user: User): Promise<void> {
    updateSaasUser(user.id, user);
    try {
      await syncUserToFirestore(user);
    } catch (e) {
      console.warn('Sync user to firestore failed:', e);
    }
    try {
      await syncUserToSupabase(user);
    } catch (e) {
      console.warn('Sync user to supabase failed:', e);
    }
  },

  async suspendClient(userId: string): Promise<void> {
    const users = getSaasUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updated: User = { ...target, status: 'suspended' };
    await this.saveClient(updated);
  },

  async activateClient(userId: string): Promise<void> {
    const users = getSaasUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updated: User = { ...target, status: 'active' };
    await this.saveClient(updated);
  },

  async removeClient(userId: string): Promise<void> {
    deleteSaasUser(userId);
    try {
      await deleteUserFromFirestore(userId);
    } catch (e) {}
    try {
      await deleteUserFromSupabase(userId);
    } catch (e) {}
  },

  // --- GESTION DES ABONNEMENTS ET TARIFS ---
  getPricing(): SaasPricingConfig {
    return getSaasPricing();
  },

  savePricing(pricing: SaasPricingConfig): void {
    saveSaasPricing(pricing);
  },

  async extendTrialDays(userId: string, days: number = 7): Promise<void> {
    const users = getSaasUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const currentExpiry = target.trialEndsAt ? new Date(target.trialEndsAt).getTime() : Date.now();
    const baseTime = currentExpiry > Date.now() ? currentExpiry : Date.now();
    const newExpiry = new Date(baseTime + days * 24 * 60 * 60 * 1000).toISOString();

    const updated: User = {
      ...target,
      trialEndsAt: newExpiry,
      subscriptionStatus: 'trial_active',
      status: 'active'
    };
    await this.saveClient(updated);
  },

  async upgradeUserToPro(userId: string, price: number = 30): Promise<void> {
    const users = getSaasUsers();
    const target = users.find(u => u.id === userId);
    if (!target) return;

    const updated: User = {
      ...target,
      subscriptionPlan: 'pro_monthly',
      subscriptionStatus: 'pro_active',
      subscriptionPrice: price,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    };
    await this.saveClient(updated);
  },

  // --- GESTION DES CRÉDITS TÉLÉCOM ---
  async addTelecomCredits(userId: string, type: 'sms' | 'rcs', amount: number): Promise<void> {
    addUserCredits(userId, type, amount);
    const users = getSaasUsers();
    const target = users.find(u => u.id === userId);
    if (target) {
      await this.saveClient(target);
    }
  },

  isSuperAdmin(userOrEmail: User | string | null | undefined): boolean {
    if (!userOrEmail) return false;
    if (typeof userOrEmail === 'string') {
      return isSuperAdminEmail(userOrEmail);
    }
    return userOrEmail.role === 'superadmin' || isSuperAdminEmail(userOrEmail.email);
  }
};
