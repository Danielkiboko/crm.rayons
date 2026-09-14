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
  ExternalLink
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
  checkUserTrialStatus 
} from '@/lib/userStore';
import { 
  fetchAllUsersFromFirestore, 
  syncUserToFirestore, 
  deleteUserFromFirestore 
} from '@/lib/firestoreService';

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
  const [newSmppCredits, setNewSmppCredits] = useState(500);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'trial' | 'pro_monthly' | 'expired'>('all');

  useEffect(() => {
    const local = getSaasUsers();
    setUsers(local);

    // Sync with Cloud Firestore
    fetchAllUsersFromFirestore().then((cloudUsers) => {
      if (cloudUsers && cloudUsers.length > 0) {
        const mergedMap = new Map<string, User>();
        local.forEach(u => mergedMap.set(u.email.toLowerCase(), u));
        cloudUsers.forEach(u => mergedMap.set(u.email.toLowerCase(), { ...mergedMap.get(u.email.toLowerCase()), ...u }));
        const merged = Array.from(mergedMap.values());
        setUsers(merged);
        saveSaasUsers(merged);
      }
    }).catch(() => {});
  }, []);

  const isMasterAdmin = currentUser?.role === 'superadmin' || 
    currentUser?.email?.toLowerCase() === 'danielkiboko218@gmail.com' ||
    currentUser?.email?.toLowerCase() === 'crm@rayons.net' || 
    currentUser?.email?.toLowerCase() === 'daniel.kiboko@rayons.net';

  if (!isMasterAdmin) {
    return (
      <div style={{ maxWidth: '600px', margin: '80px auto', textAlign: 'center', padding: '40px 24px', background: '#0a0a0a', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: '#000', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Lock size={22} />
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          Accès Restreint au C-Panel Super-Admin
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          Ce module d'administration globale est strictement réservé au Super-Administrateur (Daniel Kiboko).
        </p>
        <button onClick={() => router.push('/')} className="btn btn-primary">
          Retour à mon Espace de Travail
        </button>
      </div>
    );
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

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail || !newPassword) return;

    const isPro = newInitialPlan === 'pro_monthly';
    const newUserData: User = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      password: newPassword,
      companyName: newCompany.trim() || 'Client CRM Rayons',
      role: 'admin',
      createdAt: new Date().toISOString(),
      status: 'active',
      subscriptionPlan: newInitialPlan,
      subscriptionPrice: 30,
      subscriptionStatus: isPro ? 'pro_active' : 'trial_active',
      trialEndsAt: isPro ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionExpiresAt: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      smppCredits: Number(newSmppCredits) || 500,
      dailyEmailLimit: 50
    };

    const created = addSaasUser(newUserData);
    setUsers(created);
    syncUserToFirestore(newUserData).catch(() => {});
    setIsAddingUser(false);
    setNewName('');
    setNewEmail('');
    setNewCompany('');
    setNewPassword('Client2026!');
    showToast(`Compte créé avec succès pour ${newUserData.email} avec mot de passe : ${newUserData.password}`);
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
                <label className="label">Formule / Statut d'Abonnement</label>
                <select 
                  value={newInitialPlan} 
                  onChange={(e) => setNewInitialPlan(e.target.value as any)} 
                  className="input"
                >
                  <option value="trial">Essai Gratuit 7 Jours (Automatique)</option>
                  <option value="pro_monthly">Abonné Pro Actif (30 $ / mois)</option>
                </select>
              </div>
              <div>
                <label className="label">Crédits SMS / SMPP Dédiés</label>
                <input 
                  type="number" 
                  value={newSmppCredits} 
                  onChange={(e) => setNewSmppCredits(Number(e.target.value))} 
                  className="input" 
                  placeholder="500" 
                />
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
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Statut & Période</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Crédits SMPP</th>
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

                    <td style={{ padding: '14px 18px' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {isSuperAdmin ? 'Illimité' : `${u.smppCredits || 500} SMS`}
                      </span>
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
