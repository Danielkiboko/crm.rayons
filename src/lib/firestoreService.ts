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
  writeBatch,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { 
  User, 
  Lead, 
  Campaign, 
  UniboxMessage, 
  Deal, 
  EmailAccount, 
  WarmupConfig, 
  LinkedinAccount 
} from '@/types';

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

export async function deleteLeadFromFirestore(userId: string, leadId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !leadId) return false;
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

export async function deleteCampaignFromFirestore(userId: string, campaignId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !campaignId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'campaigns', campaignId));
    return true;
  } catch (error) {
    console.error('Firestore deleteCampaign error:', error);
    return false;
  }
}

// ================= DEALS (PIPELINE DES VENTES) =================

export async function syncDealsToFirestore(userId: string, deals: Deal[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const dealsCol = collection(db, 'users', userId, 'deals');
    const chunks = chunkArray(deals, BATCH_LIMIT);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const d of chunk) {
        batch.set(doc(dealsCol, d.id), d, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (error) {
    console.error('Firestore syncDeals error:', error);
    return false;
  }
}

export async function fetchDealsFromFirestore(userId: string): Promise<Deal[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const dealsCol = collection(db, 'users', userId, 'deals');
    const snap = await getDocs(dealsCol);
    return snap.docs.map(doc => doc.data() as Deal);
  } catch (error) {
    console.error('Firestore fetchDeals error:', error);
    return [];
  }
}

export async function saveDealToFirestore(userId: string, deal: Deal): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !deal?.id) return false;
  try {
    const dealRef = doc(db, 'users', userId, 'deals', deal.id);
    await setDoc(dealRef, deal, { merge: true });
    return true;
  } catch (error) {
    console.error('Firestore saveDeal error:', error);
    return false;
  }
}

export async function deleteDealFromFirestore(userId: string, dealId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !dealId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'deals', dealId));
    return true;
  } catch (error) {
    console.error('Firestore deleteDeal error:', error);
    return false;
  }
}

// ================= EMAIL ACCOUNTS (SMTP / IMAP) =================

export async function syncEmailAccountsToFirestore(userId: string, accounts: EmailAccount[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const accsCol = collection(db, 'users', userId, 'emailAccounts');
    const chunks = chunkArray(accounts, BATCH_LIMIT);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const acc of chunk) {
        batch.set(doc(accsCol, acc.id), acc, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (error) {
    console.error('Firestore syncEmailAccounts error:', error);
    return false;
  }
}

export async function fetchEmailAccountsFromFirestore(userId: string): Promise<EmailAccount[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const accsCol = collection(db, 'users', userId, 'emailAccounts');
    const snap = await getDocs(accsCol);
    return snap.docs.map(doc => doc.data() as EmailAccount);
  } catch (error) {
    console.error('Firestore fetchEmailAccounts error:', error);
    return [];
  }
}

export async function saveEmailAccountToFirestore(userId: string, account: EmailAccount): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !account?.id) return false;
  try {
    const accRef = doc(db, 'users', userId, 'emailAccounts', account.id);
    await setDoc(accRef, account, { merge: true });
    return true;
  } catch (error) {
    console.error('Firestore saveEmailAccount error:', error);
    return false;
  }
}

export async function deleteEmailAccountFromFirestore(userId: string, accountId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !accountId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'emailAccounts', accountId));
    return true;
  } catch (error) {
    console.error('Firestore deleteEmailAccount error:', error);
    return false;
  }
}

// ================= MESSAGES (UNIBOX) =================

export async function syncMessagesToFirestore(userId: string, messages: UniboxMessage[]): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const msgCol = collection(db, 'users', userId, 'messages');
    const chunks = chunkArray(messages, BATCH_LIMIT);

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const m of chunk) {
        batch.set(doc(msgCol, m.id), m, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (error) {
    console.error('Firestore syncMessages error:', error);
    return false;
  }
}

export async function fetchMessagesFromFirestore(userId: string): Promise<UniboxMessage[]> {
  if (!isFirebaseConfigured || !db || !userId) return [];
  try {
    const msgCol = collection(db, 'users', userId, 'messages');
    const snap = await getDocs(msgCol);
    return snap.docs.map(doc => doc.data() as UniboxMessage);
  } catch (error) {
    console.error('Firestore fetchMessages error:', error);
    return [];
  }
}

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

export async function deleteMessageFromFirestore(userId: string, messageId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId || !messageId) return false;
  try {
    await deleteDoc(doc(db, 'users', userId, 'messages', messageId));
    return true;
  } catch (error) {
    console.error('Firestore deleteMessage error:', error);
    return false;
  }
}

// ================= USER SETTINGS (WARMUP & LINKEDIN) =================

export async function syncUserSettingsToFirestore(
  userId: string, 
  settings: { warmupConfig?: WarmupConfig; linkedinAccount?: LinkedinAccount | null }
): Promise<boolean> {
  if (!isFirebaseConfigured || !db || !userId) return false;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...settings,
      settingsUpdatedAt: serverTimestamp()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Firestore syncUserSettings error:', error);
    return false;
  }
}

export async function fetchUserSettingsFromFirestore(
  userId: string
): Promise<{ warmupConfig?: WarmupConfig; linkedinAccount?: LinkedinAccount | null } | null> {
  if (!isFirebaseConfigured || !db || !userId) return null;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        warmupConfig: data.warmupConfig,
        linkedinAccount: data.linkedinAccount
      };
    }
    return null;
  } catch (error) {
    console.error('Firestore fetchUserSettings error:', error);
    return null;
  }
}

// ================= REAL-TIME SNAPSHOT LISTENERS =================

export function subscribeToFirestoreSubcollection<T>(
  userId: string,
  subcollection: 'leads' | 'campaigns' | 'messages' | 'deals' | 'emailAccounts',
  callback: (items: T[]) => void
): Unsubscribe | null {
  if (!isFirebaseConfigured || !db || !userId) return null;
  try {
    const colRef = collection(db, 'users', userId, subcollection);
    return onSnapshot(colRef, (snap) => {
      const items = snap.docs.map(d => d.data() as T);
      callback(items);
    }, (err) => {
      console.warn(`Firestore listener error on ${subcollection}:`, err.message);
    });
  } catch (e) {
    console.warn(`Failed to create Firestore listener on ${subcollection}:`, e);
    return null;
  }
}
