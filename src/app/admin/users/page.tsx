'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Server, 
  UserPlus, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  KeyRound, 
  RefreshCw, 
  Trash2, 
  ExternalLink,
  Code,
  Layers,
  Database,
  Users,
  Clock,
  Sparkles,
  Zap,
  TrendingUp,
  DollarSign,
  Plus,
  X,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, UserRole } from '@/types';
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

  // New user form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newInitialPlan, setNewInitialPlan] = useState<'trial' | 'pro_monthly'>('trial');

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
          Accès Restreint au C-Panel Central
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '24px' }}>
          Ce module d'administration globale est strictement réservé au Super-Administrateur (<span style={{ color: '#ffffff', fontFamily: 'monospace' }}>crm@rayons.net</span>). Les données et les comptes de vos clients sont isolés.
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
  const totalUsersCount = users.length;
  const trialUsers = users.filter(u => {
    const status = checkUserTrialStatus(u);
    return status.isTrialActive && !status.isSuperAdmin;
  });
  const proSubscribers = users.filter(u => {
    const status = checkUserTrialStatus(u);
    return (status.isProActive && !status.isSuperAdmin) || u.subscriptionPlan === 'pro_monthly';
  });
  const expiredUsers = users.filter(u => {
    const status = checkUserTrialStatus(u);
    return status.isExpired && !status.isSuperAdmin;
  });
  const currentMRR = proSubscribers.length * 30; // $30/mo

  // Action Handlers
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
    showToast(`✅ ${user.name} a été activé en Abonné Pro (30 $/mois) !`);
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
    showToast(`⏱️ Essai prolongé de 7 jours pour ${user.name} !`);
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
    if (user.role === 'superadmin' || user.email === 'crm@rayons.net') {
      alert('Impossible de supprimer le compte Super-Admin Master !');
      return;
    }
    if (confirm(`Supprimer définitivement le compte de ${user.name} (${user.email}) ?`)) {
      const updated = deleteSaasUser(user.id);
      setUsers(updated);
      deleteUserFromFirestore(user.id).catch(() => {});
      showToast(`Compte supprimé.`);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    const isPro = newInitialPlan === 'pro_monthly';
    const newUserData: User = {
      id: `user-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      companyName: newCompany.trim() || 'Client SaaS',
      role: 'admin',
      createdAt: new Date().toISOString(),
      status: 'active',
      subscriptionPlan: newInitialPlan,
      subscriptionPrice: 30,
      subscriptionStatus: isPro ? 'pro_active' : 'trial_active',
      trialEndsAt: isPro ? undefined : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      subscriptionExpiresAt: isPro ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
    };

    const created = addSaasUser(newUserData);
    setUsers(created);
    syncUserToFirestore(newUserData).catch(() => {});
    setIsAddingUser(false);
    setNewName('');
    setNewEmail('');
    setNewCompany('');
    showToast(`Compte créé avec succès pour ${newEmail} !`);
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
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>C-Panel SaaS & Gestion des Utilisateurs</h1>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              ADMINISTRATION AUTONOME
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Contrôlez les inscriptions autonomes, les périodes d'essai de 7 jours et les abonnements mensuels à 30 $ / mois.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingUser(!isAddingUser)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isAddingUser ? 'Fermer' : <><Plus size={16} /> Créer un Utilisateur</>}
        </button>
      </div>

      {/* 4 SaaS BUSINESS METRICS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Utilisateurs
            </span>
            <Users size={18} color="#ffffff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk' }}>
            {totalUsersCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Inscriptions self-service
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Essais en Cours (7j)
            </span>
            <Clock size={18} color="#facc15" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#facc15' }}>
            {trialUsers.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Période de test active
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Abonnés Pro ($30/m)
            </span>
            <Sparkles size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#10b981' }}>
            {proSubscribers.length}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Clients payants actifs
          </div>
        </div>

        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Revenu Mensuel (MRR)
            </span>
            <DollarSign size={18} color="#ffffff" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#ffffff' }}>
            {currentMRR} $
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            30 $ / utilisateur / mois
          </div>
        </div>
      </div>

      {/* NEW USER FORM MODAL */}
      {isAddingUser && (
        <div className="card" style={{ marginBottom: '28px', border: '1px solid #ffffff', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserPlus size={18} /> Créer un Compte Utilisateur
            </h2>
            <button onClick={() => setIsAddingUser(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nom et Prénom *</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="input" 
                  placeholder="Ex: David Martin" 
                  required 
                />
              </div>
              <div>
                <label className="label">Adresse Email *</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="input" 
                  placeholder="client@entreprise.com" 
                  required 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nom de l'Entreprise</label>
                <input 
                  type="text" 
                  value={newCompany} 
                  onChange={(e) => setNewCompany(e.target.value)} 
                  className="input" 
                  placeholder="Ex: SaaS Agency" 
                />
              </div>
              <div>
                <label className="label">Plan d'attribution</label>
                <select 
                  value={newInitialPlan} 
                  onChange={(e) => setNewInitialPlan(e.target.value as any)} 
                  className="select"
                >
                  <option value="trial">Essai Gratuit (7 Jours d'accès)</option>
                  <option value="pro_monthly">Abonnement Pro Actif (30 $/mois)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button type="button" onClick={() => setIsAddingUser(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Créer et Activer l'Accès
              </button>
            </div>
          </form>
        </div>
      )}

      {/* USERS MANAGEMENT TABLE */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {/* Table Controls */}
        <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
          <input 
            type="text" 
            placeholder="Rechercher par nom, email ou entreprise..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="input" 
            style={{ width: '320px', height: '36px', fontSize: '0.82rem' }} 
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'trial', label: 'En Essai 7j' },
              { id: 'pro_monthly', label: 'Abonnés 30 $/m' },
              { id: 'expired', label: 'Essais Expirés' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterPlan(f.id as any)}
                className={`btn btn-sm ${filterPlan === f.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.75rem' }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Utilisateur</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Entreprise</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Inscription</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Statut SaaS & Essai</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600 }}>Tarification</th>
                <th style={{ padding: '12px 20px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'right' }}>Actions C-Panel</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const trial = checkUserTrialStatus(u);
                const isSuperAdmin = trial.isSuperAdmin;

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    {/* User Info */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{u.email}</div>
                    </td>

                    {/* Company */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                      {u.companyName}
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Trial / Subscription Status */}
                    <td style={{ padding: '14px 20px' }}>
                      {isSuperAdmin ? (
                        <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={12} /> SUPER-ADMIN
                        </span>
                      ) : u.status === 'suspended' ? (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#f87171' }}>
                          <AlertTriangle size={12} /> ACCÈS BLOQUÉ
                        </span>
                      ) : trial.isProActive ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={12} /> ABONNÉ ACTIF
                        </span>
                      ) : trial.isTrialActive ? (
                        <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> ESSAI : {trial.daysRemaining}J RESTANTS
                        </span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} /> ESSAI EXPIRÉ
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td style={{ padding: '14px 20px' }}>
                      {isSuperAdmin ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Illimité</span>
                      ) : trial.isProActive ? (
                        <span style={{ fontWeight: 700, color: '#ffffff' }}>30 $ / mois</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Essai gratuit (0 $)</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                      {!isSuperAdmin ? (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                          {/* Upgrade to Pro 30$/mo button */}
                          {!trial.isProActive && (
                            <button
                              onClick={() => handleUpgradeToPro(u)}
                              className="btn btn-sm"
                              style={{ background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.72rem', padding: '4px 10px' }}
                              title="Activer l'abonnement à 30 $/mois pour cet utilisateur"
                            >
                              Passer en Pro (30 $)
                            </button>
                          )}

                          {/* Extend Trial */}
                          {trial.isTrialActive || trial.isExpired ? (
                            <button
                              onClick={() => handleExtendTrial(u)}
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                              title="Prolonger l'essai gratuit de 7 jours"
                            >
                              +7 Jours
                            </button>
                          ) : null}

                          {/* Suspend / Block Toggle */}
                          <button
                            onClick={() => handleToggleSuspend(u)}
                            className="btn btn-sm"
                            style={{ 
                              fontSize: '0.72rem', 
                              padding: '4px 10px', 
                              background: u.status === 'suspended' ? '#22c55e' : 'transparent',
                              color: u.status === 'suspended' ? '#000000' : '#ef4444',
                              border: u.status === 'suspended' ? 'none' : '1px solid rgba(239,68,68,0.4)',
                              fontWeight: 700
                            }}
                            title={u.status === 'suspended' ? 'Débloquer l\'accès pour cet utilisateur' : 'Bloquer immédiatement cet utilisateur'}
                          >
                            {u.status === 'suspended' ? 'Débloquer' : 'Bloquer'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteUser(u)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                            title="Supprimer définitivement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>Compte Maître</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    Aucun utilisateur trouvé pour ces critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rules Summary Box */}
      <div className="card" style={{ marginTop: '28px', background: 'rgba(255,255,255,0.015)' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} /> Règles du Modèle Économique & Sécurité SaaS
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <div>
            <strong style={{ color: '#fff' }}>1. Inscription Autonome (Self-Service)</strong>
            <p style={{ marginTop: '4px' }}>
              Tout nouvel utilisateur peut créer son compte gratuitement. Il obtient immédiatement 7 jours d'accès complet pour tester les envois et importer ses fichiers.
            </p>
          </div>
          <div>
            <strong style={{ color: '#fff' }}>2. Blocage Automatique au 8ème Jour</strong>
            <p style={{ marginTop: '4px' }}>
              Dès que les 7 jours sont écoulés, le Paywall bloque l'accès aux fonctionnalités d'envoi et demande la souscription à 30 $ / mois.
            </p>
          </div>
          <div>
            <strong style={{ color: '#fff' }}>3. Contrôle Total depuis ce C-Panel</strong>
            <p style={{ marginTop: '4px' }}>
              Vous pouvez à tout moment activer manuellement un client en Abonné Pro, lui accorder des jours supplémentaires, ou suspendre son compte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
