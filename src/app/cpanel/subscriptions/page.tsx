'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Zap,
  Smartphone,
  MessageSquare,
  Layers,
  Mail,
  Plus,
  Sliders,
  Check
} from 'lucide-react';
import { User, SaasPricingConfig } from '@/types';
import { 
  getSaasUsers, 
  saveSaasUsers, 
  updateSaasUser, 
  checkUserTrialStatus,
  isSuperAdminEmail,
  getSaasPricing,
  saveSaasPricing,
  toggleUserUpgrade,
  addUserCredits,
  DEFAULT_SAAS_PRICING
} from '@/lib/userStore';
import { 
  fetchAllUsersFromFirestore, 
  syncUserToFirestore 
} from '@/lib/firestoreService';

export default function CpanelSubscriptionsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pricing, setPricing] = useState<SaasPricingConfig>(DEFAULT_SAAS_PRICING);
  const [isEditingPricing, setIsEditingPricing] = useState(false);
  const [editBasePrice, setEditBasePrice] = useState(30);
  const [editSmsPrice, setEditSmsPrice] = useState(0.036);
  const [editRcsPrice, setEditRcsPrice] = useState(0.040);
  const [editLinkedinPrice, setEditLinkedinPrice] = useState(25);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  useEffect(() => {
    const local = getSaasUsers();
    setUsers(local);

    const saasPricing = getSaasPricing();
    setPricing(saasPricing);
    setEditBasePrice(saasPricing.baseEmailPrice);
    setEditSmsPrice(saasPricing.smsUnitPrice);
    setEditRcsPrice(saasPricing.rcsUnitPrice);
    setEditLinkedinPrice(saasPricing.linkedinMonthlyPrice);

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

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 4000);
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPricing: SaasPricingConfig = {
      baseEmailPrice: Number(editBasePrice),
      smsUnitPrice: Number(editSmsPrice),
      smsPackPrice1000: Math.round(Number(editSmsPrice) * 1000 * 100) / 100,
      rcsUnitPrice: Number(editRcsPrice),
      rcsPackPrice1000: Math.round(Number(editRcsPrice) * 1000 * 100) / 100,
      linkedinMonthlyPrice: Number(editLinkedinPrice)
    };
    saveSaasPricing(updatedPricing);
    setPricing(updatedPricing);
    setIsEditingPricing(false);
    showToast('💰 Grille tarifaire SaaS mise à jour avec succès !');
  };

  const clientUsers = users.filter(u => u.role !== 'superadmin' && !isSuperAdminEmail(u.email));
  const trialUsers = clientUsers.filter(u => checkUserTrialStatus(u).isTrialActive);
  const proSubscribers = clientUsers.filter(u => {
    const status = checkUserTrialStatus(u);
    return status.isProActive || u.subscriptionPlan === 'pro_monthly';
  });
  const expiredUsers = clientUsers.filter(u => checkUserTrialStatus(u).isExpired);
  
  // Financial computations
  const currentMRR = proSubscribers.length * pricing.baseEmailPrice;
  const smsClientsCount = clientUsers.filter(u => u.hasSmsUpgrade).length;
  const rcsClientsCount = clientUsers.filter(u => u.hasRcsUpgrade).length;
  const linkedinClientsCount = clientUsers.filter(u => u.hasLinkedinUpgrade).length;

  const handleUpgradeToPro = (user: User) => {
    const updated = updateSaasUser(user.id, {
      subscriptionPlan: 'pro_monthly',
      subscriptionStatus: 'pro_active',
      subscriptionPrice: pricing.baseEmailPrice,
      subscriptionExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) syncUserToFirestore(updatedUser).catch(() => {});
    showToast(`✅ ${user.name} activé en Abonné Pro (${pricing.baseEmailPrice} $/mois) !`);
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
    showToast(`⏱️ Essai gratuit de ${user.name} prolongé de +7 jours !`);
  };

  const handleToggleUpgrade = (user: User, upgradeType: 'sms' | 'rcs' | 'linkedin') => {
    const currentValue = upgradeType === 'sms' ? !!user.hasSmsUpgrade :
                         upgradeType === 'rcs' ? !!user.hasRcsUpgrade :
                         !!user.hasLinkedinUpgrade;
    const newValue = !currentValue;
    const updated = toggleUserUpgrade(user.id, upgradeType, newValue, 1000);
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) syncUserToFirestore(updatedUser).catch(() => {});
    showToast(`${newValue ? '🚀' : '🛑'} Upgrade ${upgradeType.toUpperCase()} ${newValue ? 'activé (+1000 crédits)' : 'désactivé'} pour ${user.name} !`);
  };

  const handleAddCredits = (user: User, channel: 'sms' | 'rcs', count: number) => {
    const updated = addUserCredits(user.id, channel, count);
    setUsers(updated);
    const updatedUser = updated.find(u => u.id === user.id);
    if (updatedUser) syncUserToFirestore(updatedUser).catch(() => {});
    showToast(`💳 +${count} crédits ${channel.toUpperCase()} ajoutés pour ${user.name} !`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>
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
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Abonnements & Upgrades SaaS</h1>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
              EMAIL DE BASE : {pricing.baseEmailPrice} $/MOIS
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Gestion centralisée de la tarification du CRM Rayons, forfaits de base Email Marketing et upgrades payants (SMS 0.036$, RCS 0.040$, LinkedIn).
          </p>
        </div>

        <button 
          onClick={() => setIsEditingPricing(!isEditingPricing)} 
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}
        >
          <Sliders size={15} />
          {isEditingPricing ? 'Fermer la Configuration' : 'Configurer les Tarifs'}
        </button>
      </div>

      {/* PRICING & UPGRADE CONFIGURATION PANEL */}
      {isEditingPricing && (
        <div className="card" style={{ marginBottom: '28px', border: '1px solid #ffffff', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={18} />
              Définir la Grille Tarifaire Officielle C-Panel
            </h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Les changements s'appliquent immédiatement à l'ensemble des clients
            </span>
          </div>

          <form onSubmit={handleSavePricing}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '18px' }}>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Mail size={16} color="#f59e0b" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>Email Marketing Base</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Inclus d'office dans l'abonnement mensuel standard.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number" 
                    step="1"
                    min="1"
                    value={editBasePrice} 
                    onChange={e => setEditBasePrice(Number(e.target.value))}
                    className="input"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$/mois</span>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Smartphone size={16} color="#a78bfa" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>Upgrade SMS Direct</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Coût unitaire opérateur (Pack 1000 SMS = {(editSmsPrice * 1000).toFixed(1)} $).
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number" 
                    step="0.001"
                    min="0.001"
                    value={editSmsPrice} 
                    onChange={e => setEditSmsPrice(Number(e.target.value))}
                    className="input"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$/SMS</span>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <MessageSquare size={16} color="#34d399" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>Upgrade Google RCS</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Coût unitaire Google RBM (Pack 1000 RCS = {(editRcsPrice * 1000).toFixed(1)} $).
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number" 
                    step="0.001"
                    min="0.001"
                    value={editRcsPrice} 
                    onChange={e => setEditRcsPrice(Number(e.target.value))}
                    className="input"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$/RCS</span>
                </div>
              </div>

              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <Layers size={16} color="#38bdf8" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#ffffff' }}>Upgrade LinkedIn</span>
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Option mensuelle automatisation invitations & InMails.
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input 
                    type="number" 
                    step="1"
                    min="1"
                    value={editLinkedinPrice} 
                    onChange={e => setEditLinkedinPrice(Number(e.target.value))}
                    className="input"
                    style={{ fontSize: '0.9rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>$/mois</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => setIsEditingPricing(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button type="submit" className="btn btn-primary">
                Enregistrer la Grille Tarifaire
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4 KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <span>Revenu Récurrent (MRR Base)</span>
            <DollarSign size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginTop: '6px' }}>
            ${currentMRR}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#34d399', marginTop: '4px' }}>
            {proSubscribers.length} client{proSubscribers.length > 1 ? 's' : ''} à {pricing.baseEmailPrice} $/mois
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <span>Upgrades SMS Actifs</span>
            <Smartphone size={16} color="#a78bfa" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#a78bfa', marginTop: '6px' }}>
            {smsClientsCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Tarif : {pricing.smsUnitPrice} $/SMS ({pricing.smsPackPrice1000} $/1000)
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <span>Upgrades RCS Google</span>
            <MessageSquare size={16} color="#34d399" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399', marginTop: '6px' }}>
            {rcsClientsCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            Tarif : {pricing.rcsUnitPrice} $/RCS ({pricing.rcsPackPrice1000} $/1000)
          </div>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
            <span>Upgrades LinkedIn B2B</span>
            <Layers size={16} color="#38bdf8" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>
            {linkedinClientsCount}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
            + {pricing.linkedinMonthlyPrice} $/mois par client
          </div>
        </div>
      </div>

      {/* SAAS OFFERING SUMMARY BANNER */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldCheck size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
              Règle Métier & Découpage des Offres CRM Rayons
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              1. <strong>Offre de Base ({pricing.baseEmailPrice} $/mois)</strong> : Cold Emailing illimité, comptes SMTP, Lemwarm, Unibox & CRM.
              <br />
              2. <strong>Upgrades Payants</strong> : SMS ({pricing.smsUnitPrice} $/SMS), RCS ({pricing.rcsUnitPrice} $/RCS) et LinkedIn ({pricing.linkedinMonthlyPrice} $/m) bloqués tant que l'option ou les crédits ne sont pas validés.
            </div>
          </div>
        </div>
      </div>

      {/* Subscriptions & Upgrades Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>
            Comptes Clients, Forfaits de Base & Statut des Upgrades
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {clientUsers.length} client{clientUsers.length > 1 ? 's' : ''} sous gestion
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Client & Société</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Forfait Base Email</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Upgrade SMS (0.036$)</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Upgrade RCS (0.040$)</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)' }}>Upgrade LinkedIn</th>
                <th style={{ padding: '12px 18px', color: 'var(--text-muted)', textAlign: 'right' }}>Actions Forfait</th>
              </tr>
            </thead>
            <tbody>
              {clientUsers.map((u) => {
                const trial = checkUserTrialStatus(u);

                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 700, color: '#ffffff' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{u.companyName || 'Sans société'}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>{u.email}</div>
                    </td>

                    {/* BASE EMAIL SUBSCRIPTION */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        {trial.isProActive ? (
                          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                            PRO ACTIF ({pricing.baseEmailPrice} $/M)
                          </span>
                        ) : trial.isTrialActive ? (
                          <span className="badge" style={{ background: 'rgba(250, 204, 21, 0.15)', color: '#facc15', border: '1px solid #facc15', fontSize: '0.7rem' }}>
                            <Clock size={11} style={{ display: 'inline', marginRight: '4px' }} />
                            Essai : {trial.daysRemaining}j
                          </span>
                        ) : (
                          <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                            ESSAI EXPIRÉ
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Email Cold illimité inclus
                      </div>
                    </td>

                    {/* UPGRADE SMS */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {u.hasSmsUpgrade ? (
                          <span className="badge" style={{ background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: '1px solid #a78bfa', fontSize: '0.7rem' }}>
                            ACTIVÉ
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            NON INCLUS
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ffffff' }}>
                          {u.smppCredits || 0} crédits
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleToggleUpgrade(u, 'sms')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                          title={u.hasSmsUpgrade ? 'Désactiver l\'upgrade SMS' : 'Activer l\'upgrade SMS'}
                        >
                          {u.hasSmsUpgrade ? 'Couper' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleAddCredits(u, 'sms', 1000)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '2px 6px', color: '#a78bfa' }}
                          title="Recharger +1000 SMS payés"
                        >
                          +1000 SMS
                        </button>
                      </div>
                    </td>

                    {/* UPGRADE RCS */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        {u.hasRcsUpgrade ? (
                          <span className="badge" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', border: '1px solid #34d399', fontSize: '0.7rem' }}>
                            ACTIVÉ
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            NON INCLUS
                          </span>
                        )}
                        <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#ffffff' }}>
                          {u.rcsCredits || 0} crédits
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={() => handleToggleUpgrade(u, 'rcs')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                          title={u.hasRcsUpgrade ? 'Désactiver l\'upgrade RCS' : 'Activer l\'upgrade RCS'}
                        >
                          {u.hasRcsUpgrade ? 'Couper' : 'Activer'}
                        </button>
                        <button
                          onClick={() => handleAddCredits(u, 'rcs', 1000)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.65rem', padding: '2px 6px', color: '#34d399' }}
                          title="Recharger +1000 RCS payés"
                        >
                          +1000 RCS
                        </button>
                      </div>
                    </td>

                    {/* UPGRADE LINKEDIN */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        {u.hasLinkedinUpgrade ? (
                          <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid #38bdf8', fontSize: '0.7rem' }}>
                            ACTIF (+{pricing.linkedinMonthlyPrice}$)
                          </span>
                        ) : (
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                            NON INCLUS
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleUpgrade(u, 'linkedin')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.65rem', padding: '2px 6px' }}
                      >
                        {u.hasLinkedinUpgrade ? 'Désactiver' : 'Activer Upgrade'}
                      </button>
                    </td>

                    {/* ACTIONS */}
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => handleExtendTrial(u)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.72rem', padding: '4px 8px' }}
                          title="Ajouter 7 jours d'essai gratuit"
                        >
                          +7j
                        </button>
                        {!trial.isProActive && (
                          <button
                            onClick={() => handleUpgradeToPro(u)}
                            className="btn btn-primary"
                            style={{ fontSize: '0.72rem', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Passer en formule Pro payante"
                          >
                            <Zap size={12} />
                            Activer Pro
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {clientUsers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Aucun client externe pour le moment.
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
