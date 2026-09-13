import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { User, Lead, Campaign, UniboxMessage, Deal, EmailAccount } from '@/types';

/**
 * Service d'interaction Cloud Firestore pour LemFlow CRM SaaS.
 * Fournit une synchronisation temps réel multi-tenant avec repli local transparent.
 */

// ================= USERS MANAGEMENT =================

export async function syncUserToFirestore(user: User): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Firestore syncUser error:', error);
    return false;
  }
}

export async function fetchUserFromFirestore(userId: string): Promise<User | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Firestore fetchUser error:', error);
    return null;
  }
}

export async function fetchUserByEmailFromFirestore(email: string): Promise<User | null> {
  if (!isFirebaseConfigured || !db) return null;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const usersCol = collection(db, 'users');
    const q = query(usersCol, where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data() as User;
    }
    return null;
  } catch (error) {
    console.error('Firestore fetchUserByEmail error:', error);
    return null;
  }
}

export async function fetchAllUsersFromFirestore(): Promise<User[]> {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const usersCol = collection(db, 'users');
    const snap = await getDocs(usersCol);
    return snap.docs.map(doc => doc.data() as User);
  } catch (error) {
    console.error('Firestore fetchAllUsers error:', error);
    return [];
  }
}

export async function deleteUserFromFirestore(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    await deleteDoc(doc(db, 'users', userId));
    return true;
  } catch (error) {
    console.error('Firestore deleteUser error:', error);
    return false;
  }
}

// ================= LEADS (PROSPECTS) =================

export async function syncLeadsToFirestore(userId: string, leads: Lead[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const leadsCol = collection(db, 'users', userId, 'leads');
    for (const lead of leads) {
      await setDoc(doc(leadsCol, lead.id), lead, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Firestore syncLeads error:', error);
    return false;
  }
}

export async function fetchLeadsFromFirestore(userId: string): Promise<Lead[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const leadsCol = collection(db, 'users', userId, 'leads');
    const snap = await getDocs(leadsCol);
    return snap.docs.map(doc => doc.data() as Lead);
  } catch (error) {
    console.error('Firestore fetchLeads error:', error);
    return [];
  }
}

export async function deleteLeadFromFirestore(userId: string, leadId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'leads', leadId));
    return true;
  } catch (error) {
    console.error('Firestore deleteLead error:', error);
    return false;
  }
}

// ================= CAMPAIGNS =================

export async function syncCampaignsToFirestore(userId: string, campaigns: Campaign[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const campCol = collection(db, 'users', userId, 'campaigns');
    for (const c of campaigns) {
      await setDoc(doc(campCol, c.id), c, { merge: true });
    }
    return true;
  } catch (error) {
    console.error('Firestore syncCampaigns error:', error);
    return false;
  }
}

export async function fetchCampaignsFromFirestore(userId: string): Promise<Campaign[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const campCol = collection(db, 'users', userId, 'campaigns');
    const snap = await getDocs(campCol);
    return snap.docs.map(doc => doc.data() as Campaign);
  } catch (error) {
    console.error('Firestore fetchCampaigns error:', error);
    return [];
  }
}

export async function deleteCampaignFromFirestore(userId: string, campaignId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'campaigns', campaignId));
    return true;
  } catch (error) {
    console.error('Firestore deleteCampaign error:', error);
    return false;
  }
}
