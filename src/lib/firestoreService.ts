import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { User, Lead, Campaign, UniboxMessage } from '@/types';

/**
 * Service d'interaction Cloud Firestore pour CRM Rayons SaaS.
 * Fournit une synchronisation temps réel multi-tenant avec repli local transparent.
 */

// Firestore WriteBatch max = 500 opérations
const BATCH_LIMIT = 499;

/** Découpe un tableau en sous-tableaux de `size` éléments max */
function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ================= USERS MANAGEMENT =================

export async function syncUserToFirestore(user: User): Promise<boolean> {
  if (!isFirebaseConfigured || !db) return false;
  try {
    const userRef = doc(db, 'users', user.id);
    // Ne jamais persister le mot de passe en clair
    const { password: _omit, ...safeUser } = user as any;
    await setDoc(userRef, {
      ...safeUser,
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
    const chunks = chunkArray(leads, BATCH_LIMIT);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const lead of chunk) {
        batch.set(doc(leadsCol, lead.id), lead, { merge: true });
      }
      await batch.commit();
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

// ================= CAMPAIGNS =================

export async function syncCampaignsToFirestore(userId: string, campaigns: Campaign[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const campCol = collection(db, 'users', userId, 'campaigns');
    const chunks = chunkArray(campaigns, BATCH_LIMIT);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const c of chunk) {
        batch.set(doc(campCol, c.id), c, { merge: true });
      }
      await batch.commit();
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

// ================= MESSAGES (UNIBOX) =================

export async function saveMessageToFirestore(userId: string, message: UniboxMessage): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const msgRef = doc(db, 'users', userId, 'messages', message.id);
    await setDoc(msgRef, message, { merge: true });
    return true;
  } catch (error) {
    console.error('Firestore saveMessage error:', error);
    return false;
  }
}
