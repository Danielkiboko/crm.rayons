'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  Trash2, 
  Copy,
  Users, 
  Clock, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Plus, 
  Check,
  Eye,
  EyeOff,
  Building2,
  Mail,
  Key,
  Radio,
  ExternalLink,
  Smartphone,
  MessageSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User } from '@/types';
import { 
  getSaasUsers, 
  saveSaasUsers, 
  addSaasUser, 
  updateSaasUser, 
  deleteSaasUser, 
  checkUserTrialStatus,
  isSuperAdminEmail,
  toggleUserUpgrade,
  addUserCredits
} from '@/lib/userStore';
import { 
  fetchAllUsersFromFirestore, 
  syncUserToFirestore, 
  deleteUserFromFirestore 
} from '@/lib/firestoreService';
import { fetchUsersFromSupabase, syncUserToSupabase } from '@/lib/supabaseService';
import { createAdminSecondaryAppAuth } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('Client2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newInitialPlan, setNewInitialPlan] = useState<'trial' | 'pro_monthly'>('trial');
  const [newSmppCredits, setNewSmppCredits] = useState(1000);
  const [newRcsCredits, setNewRcsCredits] = useState(1000);
  const [newHasSmsUpgrade, setNewHasSmsUpgrade] = useState(false);
  const [newHasRcsUpgrade, setNewHasRcsUpgrade] = useState(false);
  const [newHasLinkedinUpgrade, setNewHasLinkedinUpgrade] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'trial' | 'pro_monthly' | 'expired'>('all');

  useEffect(() => {
    const local = getSaasUsers();
    setUsers(local);

    // Sync with Supabase PostgreSQL & Cloud Firestore
    Promise.all([
      fetchUsersFromSupabase().catch(() => []),
      fetchAllUsersFromFirestore().catch(() => [])
    ]).then(([supabaseUsers, cloudUsers]) => {
      const allCloud = [...(supabaseUsers || []), ...(cloudUsers || [])];
      if (allCloud.length > 0) {
        const mergedMap = new Map<string, User>();
        local.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
        allCloud.forEach(u => mergedMap.set(u.email.toLowerCase(), { ...mergedMap.get(u.email.toLowerCase()), ...u }));
        const merged = Array.from(mergedMap.values());
        setUsers(merged);
        saveSaasUsers(merged);
      }
    });
  }, []);

  const isMasterAdmin = currentUser?.role === 'superadmin' || isSuperAdminEmail(currentUser?.email);

  useEffect(() => {
    if (currentUser && !isMasterAdmin) {
      router.replace('/campaigns');
    }
  }, [currentUser, isMasterAdmin, router]);

  if (!isMasterAdmin) {
    return null;
  }

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  // SaaS KPIs Calculations
  const clientUsers = users.filter(u => u.role !== 'superadmin' && u.email !== 'danielkiboko218@gmail.com');
  const trialUsers = clientUsers.filter(u => {
    const status = checkUserTrialStatus(u);
    return status.isTrialActive;
  });
  const proSubscribers = clientUsers.filter(u => {
    const status = checkUserTrialStatus(u);
    return status.isProActive || u.subscriptionPlan === 'pro_monthly';
  });
  const currentMRR = proSubscribers.length * 30;

  // Actions
  const handleUpgradeToPro = (user: User) => {
    const updated = updateSaasUser(user.id, {
      subscriptionPlan: 'pro_monthly',
      subscriptionStatus: 'pro_active',
      subscriptionPrice: 30,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) syncUserToFirestore(updatedUser).catch(() => {});
    showToast(`✅ ${user.name} activé en Abonné Pro (30 $/mois) !`);
  };

  const handleExtendTrial = (user: User) => {
    const currentEnd = user.trialEndsAt ? new Date(user.trialEndsAt).getTime() : Date.now();
    const newEnd = new Date(Math.max(Date.now(), currentEnd) + 7 * 24 * 60 * 60 * 1000).toISOString();

    const updated = updateSaasUser(user.id, {
      subscriptionPlan: 'trial',
      subscriptionStatus: 'trial_active',
      trialEndsAt: newEnd
    });
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) syncUserToFirestore(updatedUser).catch(() => {});
    showToast(`⏱️ Essai de ${user.name} prolongé de +7 jours !`);
  };

  const handleToggleSuspend = (user: User) => {
    const nextStatus = user.status === 'suspended' ? 'active' : 'suspended';
    const updated = updateSaasUser(user.id, { status: nextStatus });
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) syncUserToFirestore(updatedUser).catch(() => {});
    showToast(`Compte ${user.email} ${nextStatus === 'suspended' ? 'bloqué' : 'débloqué'}.`);
  };

  const handleDeleteUser = (user: User) => {
    if (user.role === 'superadmin' || user.email === 'danielkiboko218@gmail.com') {
      alert('Impossible de supprimer le compte Super-Admin !');
      return;
    }
    if (confirm(`Supprimer définitivement le compte de ${user.name} (${user.email}) ?`)) {
      const updated = deleteSaasUser(user.id);
      setUsers(updated);
      deleteUserFromFirestore(user.id).catch(() => {});
      showToast(`Compte de ${user.name} supprimé.`);
    }
  };

  const handleToggleUpgrade = (user: User, upgradeType: 'sms' | 'rcs' | 'linkedin') => {
    const currentValue = upgradeType === 'sms' ? !!user.hasSmsUpgrade :
                         upgradeType === 'rcs' ? !!user.hasRcsUpgrade :
                         !!user.hasLinkedinUpgrade;
    const newValue = !currentValue;
    const updated = toggleUserUpgrade(user.id, upgradeType, newValue, 1000);
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) {
      syncUserToFirestore(updatedUser).catch(() => {});
      syncUserToSupabase(updatedUser).catch(() => {});
    }
    showToast(`${newValue ? '🚀' : '🛑'} Upgrade ${upgradeType.toUpperCase()} ${newValue ? 'activé (+1000 crédits)' : 'désactivé'} pour ${user.name} !`);
  };

  const handleAddCredits = (user: User, channel: 'sms' | 'rcs', count: number) => {
    const updated = addUserCredits(user.id, channel, count);
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) {
      syncUserToFirestore(updatedUser).catch(() => {});
      syncUserToSupabase(updatedUser).catch(() => {});
    }
    showToast(`💳 +${count} crédits ${channel.toUpperCase()} ajoutés pour ${user.name} !`);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    try {
      // 1. Create real Auth user via secondary app (so Admin stays logged in)
      const secondaryAuth = createAdminSecondaryAppAuth();
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail.trim().toLowerCase(), newPassword);
      const newUid = userCredential.user.uid;
      
      // Sign out the secondary app so it doesn't leak session
      await signOut(secondaryAuth);

      // 2. Prepare user object with the real Firebase UID
      const isPro = newInitialPlan === 'pro_monthly';
      const newUserData: User = {
        id: newUid,
        name: newName.trim(),
        email: newEmail.trim().toLowerCase(),
        password: newPassword,
        companyName: newCompany.trim() || 'Client CRM Rayons',
        role: 'client',
        createdAt: new Date().toISOString(),
        status: 'active',
        subscriptionPlan: newInitialPlan,
        subscriptionPrice: 30,
        subscriptionStatus: isPro ? 'pro_active' : 'trial_active',
        trialEndsAt: isPro ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        subscriptionExpiresAt: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        smppCredits: newHasSmsUpgrade ? (Number(newSmppCredits) || 1000) : 0,
        rcsCredits: newHasRcsUpgrade ? (Number(newRcsCredits) || 1000) : 0,
        dailyEmailLimit: 50,
        hasSmsUpgrade: newHasSmsUpgrade,
        hasRcsUpgrade: newHasRcsUpgrade,
        hasLinkedinUpgrade: newHasLinkedinUpgrade
      };

      // 3. Save to Local & Sync to Supabase + Firestore
      const created = addSaasUser(newUserData);
      setUsers(created);
      await Promise.all([
        syncUserToFirestore(newUserData).catch(() => {}),
        syncUserToSupabase(newUserData).catch(() => {})
      ]);
      
      setIsAddingUser(false);
      setNewName('');
      setNewEmail('');
      setNewCompany('');
      setNewPassword('Client2026!');
      setNewHasSmsUpgrade(false);
      setNewHasRcsUpgrade(false);
      setNewHasLinkedinUpgrade(false);
      setNewSmppCredits(1000);
      setNewRcsCredits(1000);
      showToast(`Compte créé avec succès pour ${newUserData.email} avec mot de passe : ${newUserData.password}`);
    } catch (error: any) {
      console.error('Erreur création auth Firebase:', error);
      alert(`Erreur création utilisateur Firebase : ${error.message}`);
    }
  };

  const handleCopyCredentials = (u: User) => {
    const text = `Vos accès CRM Rayons :\nPlateforme : http://localhost:3000/login\nEmail : ${u.email}\nMot de passe : ${u.password || 'Non défini'}\nStatut : 7 jours d'essai gratuit`;
    navigator.clipboard.writeText(text);
    setCopiedId(u.id);
    showToast(`Identifiants copiés dans le presse-papier !`);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Filtered list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.companyName.toLowerCase().includes(searchTerm.toLowerCase());

    const trial = checkUserTrialStatus(u);
    let matchesPlan = true;
    if (filterPlan === 'trial') matchesPlan = trial.isTrialActive;
    if (filterPlan === 'pro_monthly') matchesPlan = trial.isProActive && !trial.isSuperAdmin;
    if (filterPlan === 'expired') matchesPlan = trial.isExpired && !trial.isSuperAdmin;

    return matchesSearch && matchesPlan;
  });

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Toast Notice */}
      {toastNotice && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#000000',
          border: '1px solid #ffffff',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.9)',
          zIndex: 99999,
          fontSize: '0.85rem'
        }}>
          {toastNotice}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>C-Panel Super-Admin | CRM Rayons</h1>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>MAÎTRE DU SAAS</span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>SMPP & OUTREACH ALL-IN-ONE</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Gérez vos clients réels, créez des comptes avec accès direct ou laissez les prospects s'auto-inscrire sur la page de connexion avec 7 jours d'essai gratuit.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingUser(!isAddingUser)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isAddingUser ? 'Fermer' : <><Plus size={16} /> Créer un Utilisateur Client</>}
        </button>
      </div>

      {/* 2 Ways of Onboarding Banner */}
      <div className="card" style={{
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.15)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        fontSize: '0.82rem'
      }}>
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={15} /> 1. Création Manuelle par Vous (Admin)
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Cliquez sur <strong>"Créer un Utilisateur Client"</strong>, définissez son email et mot de passe, et donnez-lui ses accès immédiatement.
          </p>
        </div>
        <div>
          <div style={{ fontWeight: 700, color: '#ffffff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ExternalLink size={15} /> 2. Auto-Inscription Client (7j Gratuit)
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Un prospect peut aller sur <strong style={{ color: '#fff' }}>http://localhost:3000/login</strong> (onglet "Essai 7 Jours"). Son compte est créé instantanément et apparaît ici en direct !
          </p>
        </div>
      </div>

      {/* 4 KPIs SaaS Real Business */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clients Inscrits</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, marginTop: '4px' }}>{clientUsers.length}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Hors compte Super-Admin</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Essais Actifs (7 Jours)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#facc15', marginTop: '4px' }}>{trialUsers.length}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Période de test en cours</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Abonnés Pro Payants</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#34d399', marginTop: '4px' }}>{proSubscribers.length}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>30 $ / mois par client</div>
        </div>
        <div className="card" style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Revenu Mensuel (MRR)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>${currentMRR}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Facturation récurrente</div>
        </div>
      </div>

      {/* USER CREATION MODAL / PANEL */}
      {isAddingUser && (
        <div className="card" style={{ marginBottom: '28px', border: '1px solid #ffffff', animation: 'fadeIn 0.2s ease' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} />
            Créer un Compte Client pour Tester l'Application
          </h2>

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nom et Prénom du Client *</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="input" 
                  placeholder="Ex: Jean Dupont" 
                  required 
                />
              </div>
              <div>
                <label className="label">Adresse Email Professionnelle *</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="input" 
                  placeholder="jean@entreprise.com" 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Mot de Passe Initial de Connexion *</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    className="input" 
                    placeholder="••••••••" 
                    style={{ paddingRight: '36px' }}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Nom de l'Entreprise Client</label>
                <input 
                  type="text" 
                  value={newCompany} 
                  onChange={(e) => setNewCompany(e.target.value)} 
                  className="input" 
                  placeholder="Ex: Dupont Telecom SARL" 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Formule / Statut d'Abonnement Base</label>
                <select 
                  value={newInitialPlan} 
                  onChange={(e) => setNewInitialPlan(e.target.value as any)} 
                  className="input"
                >
                  <option value="trial">Essai Gratuit 7 Jours (Email Marketing inclus)</option>
                  <option value="pro_monthly">Abonné Pro Actif (30 $ / mois - Email inclus)</option>
                </select>
              </div>
              <div>
                <label className="label">Canal Inclus par Défaut</label>
                <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #f59e0b', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={15} />
                  <span>Email Marketing Lemlist Standard (Cold Emailing Inclus)</span>
                </div>
              </div>
            </div>

            {/* Options Upgrades Payants */}
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#facc15" />
                Upgrades Payants Additionnels Débloqués
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                {/* SMS Upgrade */}
                <div style={{ padding: '10px', background: newHasSmsUpgrade ? 'rgba(167, 139, 250, 0.08)' : 'transparent', border: newHasSmsUpgrade ? '1px solid #a78bfa' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                    <input 
                      type="checkbox" 
                      checked={newHasSmsUpgrade} 
                      onChange={e => setNewHasSmsUpgrade(e.target.checked)} 
                    />
                    <Smartphone size={14} color="#a78bfa" />
                    <span>Upgrade SMS (0.036 $)</span>
                  </label>
                  {newHasSmsUpgrade && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Crédits SMS offerts</label>
                      <input 
                        type="number" 
                        value={newSmppCredits} 
                        onChange={e => setNewSmppCredits(Number(e.target.value))} 
                        className="input" 
                        style={{ fontSize: '0.78rem', padding: '4px 8px', marginTop: '2px' }}
                      />
                    </div>
                  )}
                </div>

                {/* RCS Upgrade */}
                <div style={{ padding: '10px', background: newHasRcsUpgrade ? 'rgba(52, 211, 153, 0.08)' : 'transparent', border: newHasRcsUpgrade ? '1px solid #34d399' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                    <input 
                      type="checkbox" 
                      checked={newHasRcsUpgrade} 
                      onChange={e => setNewHasRcsUpgrade(e.target.checked)} 
                    />
                    <MessageSquare size={14} color="#34d399" />
                    <span>Upgrade RCS (0.040 $)</span>
                  </label>
                  {newHasRcsUpgrade && (
                    <div style={{ marginTop: '8px' }}>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Crédits RCS offerts</label>
                      <input 
                        type="number" 
                        value={newRcsCredits} 
                        onChange={e => setNewRcsCredits(Number(e.target.value))} 
                        className="input" 
                        style={{ fontSize: '0.78rem', padding: '4px 8px', marginTop: '2px' }}
                      />
                    </div>
                  )}
                </div>

                {/* LinkedIn Upgrade */}
                <div style={{ padding: '10px', background: newHasLinkedinUpgrade ? 'rgba(56, 189, 248, 0.08)' : 'transparent', border: newHasLinkedinUpgrade ? '1px solid #38bdf8' : '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, color: '#ffffff' }}>
                    <input 
                      type="checkbox" 
                      checked={newHasLinkedinUpgrade} 
                      onChange={e => setNewHasLinkedinUpgrade(e.target.checked)} 
                    />
                    <Radio size={14} color="#38bdf8" />
                    <span>Upgrade LinkedIn (B2B)</span>
                  </label>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    Automatisation des visites & InMails
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button type="button" onClick={() => setIsAddingUser(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Créer et Valider le Compte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CLIENTS TABLE */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Table Filter Bar */}
        <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <input 
            type="text" 
            placeholder="Rechercher un client..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="input" 
            style={{ width: '280px', fontSize: '0.82rem' }}
          />

          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: `Tous (${users.length})` },
              { id: 'trial', label: `Essais 7j (${trialUsers.length})` },
              { id: 'pro_monthly', label: `Pro Payant (${proSubscribers.length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterPlan(f.id as any)}
                className={`btn btn-sm ${filterPlan === f.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem', padding: '5px 12px' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Utilisateur</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Entreprise</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Statut Licence</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Upgrades Débloqués</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions Super-Admin</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const trial = checkUserTrialStatus(u);
                const isSuperAdmin = u.role === 'superadmin' || u.email === 'danielkiboko218@gmail.com';

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: isSuperAdmin ? '#ffffff' : 'rgba(255,255,255,0.06)',
                          color: isSuperAdmin ? '#000000' : '#ffffff',
                          fontWeight: 800,
                          fontSize: '0.75rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {u.name}
                            {isSuperAdmin && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>SUPER ADMIN</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontWeight: 600 }}>{u.companyName}</span>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      {isSuperAdmin ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>ACCÈS TOTAL ILLIMITÉ</span>
                      ) : trial.isTrialActive ? (
                        <div>
                          <span className="badge" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: '1px solid #facc15', fontSize: '0.7rem' }}>
                            <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                            Essai Actif : {trial.daysRemaining} jour{trial.daysRemaining > 1 ? 's' : ''} restant{trial.daysRemaining > 1 ? 's' : ''}
                          </span>
                        </div>
                      ) : trial.isProActive ? (
                        <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                          ABONNÉ PRO (30 $/MOIS)
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                          ESSAI EXPIRÉ
                        </span>
                      )}
                    </td>

                    {/* UPGRADES STATUS & TOGGLES */}
                    <td style={{ padding: '14px 18px' }}>
                      {isSuperAdmin ? (
                        <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>Tous canaux illimités</span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid #f59e0b' }}>
                              Email (Inclus Base)
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                            <span className="badge" style={{ fontSize: '0.65rem', background: u.hasSmsUpgrade ? 'rgba(167, 139, 250, 0.15)' : 'rgba(255,255,255,0.05)', color: u.hasSmsUpgrade ? '#a78bfa' : 'var(--text-muted)', border: u.hasSmsUpgrade ? '1px solid #a78bfa' : '1px solid var(--border-subtle)' }}>
                              SMS : {u.hasSmsUpgrade ? `${u.smppCredits || 0} crédits` : 'Non inclus'}
                            </span>
                            <button
                              onClick={() => handleToggleUpgrade(u, 'sms')}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem', textDecoration: 'underline' }}
                            >
                              {u.hasSmsUpgrade ? 'Off' : 'Activer'}
                            </button>
                            {u.hasSmsUpgrade && (
                              <button
                                onClick={() => handleAddCredits(u, 'sms', 1000)}
                                style={{ background: 'rgba(167, 139, 250, 0.2)', border: '1px solid #a78bfa', color: '#ffffff', cursor: 'pointer', fontSize: '0.62rem', borderRadius: '3px', padding: '1px 4px' }}
                                title="Recharger +1000 SMS"
                              >
                                +1k SMS
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                            <span className="badge" style={{ fontSize: '0.65rem', background: u.hasRcsUpgrade ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)', color: u.hasRcsUpgrade ? '#34d399' : 'var(--text-muted)', border: u.hasRcsUpgrade ? '1px solid #34d399' : '1px solid var(--border-subtle)' }}>
                              RCS : {u.hasRcsUpgrade ? `${u.rcsCredits || 0} crédits` : 'Non inclus'}
                            </span>
                            <button
                              onClick={() => handleToggleUpgrade(u, 'rcs')}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem', textDecoration: 'underline' }}
                            >
                              {u.hasRcsUpgrade ? 'Off' : 'Activer'}
                            </button>
                            {u.hasRcsUpgrade && (
                              <button
                                onClick={() => handleAddCredits(u, 'rcs', 1000)}
                                style={{ background: 'rgba(52, 211, 153, 0.2)', border: '1px solid #34d399', color: '#ffffff', cursor: 'pointer', fontSize: '0.62rem', borderRadius: '3px', padding: '1px 4px' }}
                                title="Recharger +1000 RCS"
                              >
                                +1k RCS
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem' }}>
                            <span className="badge" style={{ fontSize: '0.65rem', background: u.hasLinkedinUpgrade ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.05)', color: u.hasLinkedinUpgrade ? '#38bdf8' : 'var(--text-muted)', border: u.hasLinkedinUpgrade ? '1px solid #38bdf8' : '1px solid var(--border-subtle)' }}>
                              LinkedIn : {u.hasLinkedinUpgrade ? 'Actif' : 'Non inclus'}
                            </span>
                            <button
                              onClick={() => handleToggleUpgrade(u, 'linkedin')}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.65rem', textDecoration: 'underline' }}
                            >
                              {u.hasLinkedinUpgrade ? 'Off' : 'Activer'}
                            </button>
                          </div>
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      {isSuperAdmin ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compte Maître</span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {/* Copy credentials button */}
                          <button
                            onClick={() => handleCopyCredentials(u)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Copier les identifiants pour le client"
                          >
                            {copiedId === u.id ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                            {copiedId === u.id ? 'Copié' : 'Identifiants'}
                          </button>

                          {/* +7 days */}
                          <button
                            onClick={() => handleExtendTrial(u)}
                            className="btn btn-secondary"
                            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            title="Ajouter 7 jours d'essai gratuit"
                          >
                            +7j
                          </button>

                          {/* Activate Pro */}
                          <button
                            onClick={() => handleUpgradeToPro(u)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                            title="Activer en abonné Pro payant"
                          >
                            Activer Pro
                          </button>

                          {/* Suspend / Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            title="Supprimer ce compte"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 1 && (
                <tr>
                  <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Users size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                    <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Aucun client pour le moment</div>
                    <div style={{ fontSize: '0.8rem' }}>
                      Cliquez sur <strong>"Créer un Utilisateur Client"</strong> ci-dessus pour ajouter votre premier utilisateur test !
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
