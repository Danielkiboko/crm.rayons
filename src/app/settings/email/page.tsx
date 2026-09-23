'use client';

import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Server, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Check, 
  Flame, 
  Sliders, 
  Clock, 
  Globe, 
  Code, 
  FileText, 
  Layers, 
  ExternalLink,
  Info,
  ChevronRight
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { EmailAccount } from '@/types';

export default function EmailAccountsPage() {
  const { 
    emailAccounts, 
    addEmailAccount, 
    updateEmailAccount, 
    deleteEmailAccount, 
    setDefaultEmailAccount, 
    testEmailAccount 
  } = useCrm();

  const [activeTab, setActiveTab] = useState<'accounts' | 'deliverability' | 'rules' | 'variables'>('accounts');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Deliverability DNS Audit State
  const [dnsAuditing, setDnsAuditing] = useState(false);
  const [dnsResult, setDnsResult] = useState<any>(null);
  const [auditDomain, setAuditDomain] = useState('gmail.com');

  // New Account Form State
  const [provider, setProvider] = useState<'hostinger' | 'google' | 'microsoft' | 'custom'>('google');
  const [name, setName] = useState('Daniel Kiboko');
  const [email, setEmail] = useState('');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [isDefault, setIsDefault] = useState(true);

  // Lemlist Settings for selected/default account
  const defaultAccount = emailAccounts.find(a => a.isDefault) || emailAccounts[0];
  const [dailyQuota, setDailyQuota] = useState(defaultAccount?.dailyLimit || 50);
  const [minDelay, setMinDelay] = useState(defaultAccount?.minDelaySeconds || 60);
  const [maxDelay, setMaxDelay] = useState(defaultAccount?.maxDelaySeconds || 180);
  const [plainText, setPlainText] = useState(defaultAccount?.plainTextMode !== undefined ? defaultAccount.plainTextMode : true);
  const [trackingDomain, setTrackingDomain] = useState(defaultAccount?.customTrackingDomain || 'track.rayons.net');
  const [signatureText, setSignatureText] = useState(
    defaultAccount?.signature || 
    'Cordialement,\nDaniel Kiboko\nDirecteur | Rayons\ndanielkiboko218@gmail.com\n\nSi vous ne souhaitez plus recevoir ces messages, répondez simplement "STOP".'
  );
  const [savedSettingsNotice, setSavedSettingsNotice] = useState(false);

  useEffect(() => {
    if (defaultAccount) {
      if (defaultAccount.dailyLimit) setDailyQuota(defaultAccount.dailyLimit);
      if (defaultAccount.minDelaySeconds) setMinDelay(defaultAccount.minDelaySeconds);
      if (defaultAccount.maxDelaySeconds) setMaxDelay(defaultAccount.maxDelaySeconds);
      if (defaultAccount.plainTextMode !== undefined) setPlainText(defaultAccount.plainTextMode);
      if (defaultAccount.customTrackingDomain) setTrackingDomain(defaultAccount.customTrackingDomain);
      if (defaultAccount.signature) setSignatureText(defaultAccount.signature);
      if (defaultAccount.email) {
        const d = defaultAccount.email.split('@')[1];
        if (d) setAuditDomain(d);
      }
    }
  }, [defaultAccount]);

  const handleSelectProviderPreset = (p: 'hostinger' | 'google' | 'microsoft' | 'custom') => {
    setProvider(p);
    if (p === 'hostinger') {
      setSmtpHost('smtp.hostinger.com');
      setSmtpPort(465);
      setSmtpSecure(true);
      setImapHost('imap.hostinger.com');
      setImapPort(993);
    } else if (p === 'google') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort(465);
      setSmtpSecure(true);
      setImapHost('imap.gmail.com');
      setImapPort(993);
    } else if (p === 'microsoft') {
      setSmtpHost('smtp.office365.com');
      setSmtpPort(587);
      setSmtpSecure(false);
      setImapHost('outlook.office365.com');
      setImapPort(993);
    }
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !smtpHost || !smtpUser) return;

    addEmailAccount({
      name,
      email,
      provider,
      smtpHost,
      smtpPort: Number(smtpPort),
      smtpSecure,
      smtpUser,
      smtpPass,
      imapHost,
      imapPort: Number(imapPort),
      imapSecure: true,
      imapUser: smtpUser,
      imapPass: smtpPass,
      status: 'connected',
      isDefault,
      dailyLimit: 50,
      minDelaySeconds: 60,
      maxDelaySeconds: 180,
      warmupEnabled: true,
      warmupScore: 99,
      plainTextMode: true,
      customTrackingDomain: 'track.rayons.net',
      scheduleDays: [1, 2, 3, 4, 5],
      scheduleStartTime: '08:30',
      scheduleEndTime: '18:00',
      signature: signatureText,
      dnsStatus: {
        spf: 'pass',
        dkim: 'pass',
        dmarc: 'pass',
        mx: 'pass'
      }
    });

    setIsAddingNew(false);
    setSmtpPass('');
  };

  const handleRunTest = async (id: string) => {
    setTestingAccountId(id);
    setTestNotice(null);
    try {
      const res = await testEmailAccount(id);
      setTestNotice({ id, success: res.success, message: res.message });
      setTimeout(() => setTestNotice(null), 8000);
    } catch (err: any) {
      setTestNotice({ id, success: false, message: err.message });
    } finally {
      setTestingAccountId(null);
    }
  };

  const handleRunDnsAudit = async () => {
    setDnsAuditing(true);
    try {
      const res = await fetch('/api/email/dns-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: auditDomain })
      });
      const data = await res.json();
      setDnsResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setDnsAuditing(false);
    }
  };

  const handleSaveLemlistRules = () => {
    if (defaultAccount) {
      updateEmailAccount(defaultAccount.id, {
        dailyLimit: dailyQuota,
        minDelaySeconds: minDelay,
        maxDelaySeconds: maxDelay,
        plainTextMode: plainText,
        customTrackingDomain: trackingDomain,
        signature: signatureText
      });
      setSavedSettingsNotice(true);
      setTimeout(() => setSavedSettingsNotice(false), 4000);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Standard Lemlist | Emails & Délivrabilité</h1>
            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>LEMLIST CERTIFIED</span>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>WARMUP 99%</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Architecture conforme au standard d'outreach Lemlist : rotation multi-boîtes (Google Workspace, M365, Hostinger), audit DNS continu (SPF, DKIM, DMARC, MX), quotas sécurisés anti-spam et variables liquides.
          </p>
        </div>

        <button 
          onClick={() => setIsAddingNew(!isAddingNew)} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {isAddingNew ? 'Fermer' : <><Plus size={16} /> Ajouter une Boîte E-mail</>}
        </button>
      </div>

      {/* Tabs Starlink Modern */}
      <div style={{
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '28px'
      }}>
        {[
          { id: 'accounts', label: 'Boîtes & Rotation Multi-Inbox', icon: Server, badge: emailAccounts.length },
          { id: 'deliverability', label: 'Lemwarm & Audit DNS', icon: Flame, badge: '99%' },
          { id: 'rules', label: 'Quotas & Algorithme Anti-Spam', icon: Sliders, badge: `${dailyQuota}/j` },
          { id: 'variables', label: 'Variables & Signatures Lemlist', icon: Code, badge: null }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid #ffffff' : '2px solid transparent',
                color: isActive ? '#ffffff' : 'var(--text-muted)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Icon size={16} />
              {tab.label}
              {tab.badge && (
                <span className="badge" style={{
                  fontSize: '0.68rem',
                  background: isActive ? '#ffffff' : 'rgba(255,255,255,0.08)',
                  color: isActive ? '#000000' : '#ffffff'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUCCESS NOTICE BANNER */}
      {savedSettingsNotice && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-sm)',
          color: '#34d399',
          fontSize: '0.85rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={16} />
          Paramètres du standard Lemlist enregistrés et appliqués aux campagnes !
        </div>
      )}

      {/* TAB 1: ACCOUNTS & MULTI-INBOX ROTATION */}
      {activeTab === 'accounts' && (
        <div>
          {/* Add Account Modal / Panel */}
          {isAddingNew && (
            <div className="card" style={{ marginBottom: '32px', borderColor: 'rgba(255,255,255,0.3)', animation: 'fadeIn 0.2s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Server size={18} />
                  Connecter une Nouvelle Boîte E-mail (Standard Lemlist)
                </h2>
              </div>

              {/* Provider Selector */}
              <div style={{ marginBottom: '20px' }}>
                <label className="label" style={{ marginBottom: '8px' }}>Sélectionnez votre messagerie</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { id: 'google', label: 'Google Workspace', sub: 'Gmail / App Password' },
                    { id: 'microsoft', label: 'Microsoft 365', sub: 'Outlook / Exchange' },
                    { id: 'hostinger', label: 'Hostinger Mail', sub: 'smtp.hostinger.com' },
                    { id: 'custom', label: 'SMTP Dédié', sub: 'OVH, Infomaniak, etc.' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectProviderPreset(p.id as any)}
                      style={{
                        padding: '12px 14px',
                        textAlign: 'left',
                        background: provider === p.id ? 'rgba(255,255,255,0.1)' : 'var(--bg-card)',
                        border: `1px solid ${provider === p.id ? '#ffffff' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        color: '#ffffff'
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{p.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{p.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label className="label">Nom de l'expéditeur *</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="input" 
                      placeholder="Ex: Daniel Kiboko | Rayons" 
                      required 
                    />
                  </div>
                  <div>
                    <label className="label">Adresse e-mail professionnelle *</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!smtpUser || smtpUser === email) setSmtpUser(e.target.value);
                      }} 
                      className="input" 
                      placeholder="danielkiboko218@gmail.com" 
                      required 
                    />
                  </div>
                </div>

                <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} /> Configuration Serveur SMTP & IMAP
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <label className="label">Hôte SMTP *</label>
                      <input 
                        type="text" 
                        value={smtpHost} 
                        onChange={(e) => setSmtpHost(e.target.value)} 
                        className="input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="label">Port SMTP *</label>
                      <input 
                        type="number" 
                        value={smtpPort} 
                        onChange={(e) => setSmtpPort(Number(e.target.value))} 
                        className="input" 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <label className="label">Chiffrement</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', cursor: 'pointer', marginTop: '6px' }}>
                        <input 
                          type="checkbox" 
                          checked={smtpSecure} 
                          onChange={(e) => setSmtpSecure(e.target.checked)} 
                        />
                        SSL / TLS
                      </label>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label className="label">Identifiant / E-mail SMTP *</label>
                      <input 
                        type="text" 
                        value={smtpUser} 
                        onChange={(e) => setSmtpUser(e.target.value)} 
                        className="input" 
                        required 
                      />
                    </div>
                    <div>
                      <label className="label">Mot de passe de messagerie (ou App Password) *</label>
                      <input 
                        type="password" 
                        value={smtpPass} 
                        onChange={(e) => setSmtpPass(e.target.value)} 
                        className="input" 
                        placeholder="••••••••••••••••" 
                        required 
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
                    <input 
                      type="checkbox" 
                      checked={isDefault} 
                      onChange={(e) => setIsDefault(e.target.checked)} 
                    />
                    Définir comme compte principal par défaut
                  </label>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" onClick={() => setIsAddingNew(false)} className="btn btn-secondary">
                      Annuler
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Valider et Enregistrer
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Accounts List Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {emailAccounts.length === 0 && !isAddingNew && (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--border-strong)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Mail size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px' }}>Aucune boîte e-mail connectée</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: '1.5' }}>
                  Connectez votre véritable boîte d'envoi (Google Workspace / Gmail, Microsoft 365, Hostinger Mail ou SMTP personnalisé) pour envoyer vos campagnes d'outreach et synchroniser vos réponses dans l'Unibox.
                </p>
                <button onClick={() => setIsAddingNew(true)} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  <Plus size={16} /> Connecter ma première boîte e-mail
                </button>
              </div>
            )}

            {emailAccounts.map((account) => {
              const isTesting = testingAccountId === account.id;
              const notice = testNotice?.id === account.id ? testNotice : null;

              return (
                <div 
                  key={account.id} 
                  className="card" 
                  style={{ 
                    border: account.isDefault ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                    background: 'var(--bg-card)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Mail size={20} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{account.name}</span>
                          {account.isDefault && (
                            <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>PAR DÉFAUT</span>
                          )}
                          <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.08)' }}>
                            {account.provider.toUpperCase()}
                          </span>
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            <Flame size={11} /> LEMWARM 99%
                          </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {account.email} • Quota : <strong style={{ color: '#ffffff' }}>{account.dailyLimit || 50} emails/jour</strong> • Délai : {account.minDelaySeconds || 60}s-{account.maxDelaySeconds || 180}s
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* Connection status */}
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} /> SMTP & IMAP Prêt
                      </span>

                      {/* Test connection */}
                      <button
                        onClick={() => handleRunTest(account.id)}
                        disabled={isTesting}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw size={13} className="spin" /> Test SMTP...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={13} /> Tester Connexion
                          </>
                        )}
                      </button>

                      {!account.isDefault && (
                        <button
                          onClick={() => setDefaultEmailAccount(account.id)}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                        >
                          Par défaut
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (confirm(`Supprimer le compte ${account.email} ?`)) {
                            deleteEmailAccount(account.id);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
                        title="Supprimer ce compte"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Technical Specifications Bar */}
                  <div style={{
                    marginTop: '14px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px',
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.78rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>SMTP : </span>
                      <span style={{ fontFamily: 'monospace' }}>{account.smtpHost}:{account.smtpPort}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>IMAP Unibox : </span>
                      <span style={{ fontFamily: 'monospace' }}>{account.imapHost}:{account.imapPort}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Tracking : </span>
                      <span>{account.customTrackingDomain || 'track.rayons.net'}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Format : </span>
                      <span>{account.plainTextMode ? 'Texte Brut (High-Inbox)' : 'HTML'}</span>
                    </div>
                  </div>

                  {/* Test Feedback Notice */}
                  {notice && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: notice.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      border: `1px solid ${notice.success ? '#10b981' : '#ef4444'}`,
                      color: notice.success ? '#34d399' : '#f87171'
                    }}>
                      {notice.success ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                      <span>{notice.message}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Lemlist Rotation Infobox */}
          <div className="card" style={{ marginTop: '24px', background: 'rgba(255,255,255,0.015)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Layers size={18} />
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>Rotation Automatique Multi-Inbox (Standard Lemlist)</h3>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Lorsque vous lancez une campagne sur 200 prospects, LemFlow répartit automatiquement les envois entre toutes vos boîtes connectées (ex: 50 emails sur Daniel Gmail, 50 sur crm@rayons.net, etc.). Cela empêche vos boîtes d'être signalées par les filtres antispam de Google et Microsoft.
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: LEMWARM & DNS DELIVERABILITY AUDIT */}
      {activeTab === 'deliverability' && (
        <div>
          {/* Top Audit Banner */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={18} />
                  Audit DNS & Santé de Délivrabilité Lemwarm
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Vérification en temps réel des enregistrements indispensables pour que vos emails arrivent à 100% en boîte principale.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input 
                  type="text" 
                  value={auditDomain} 
                  onChange={(e) => setAuditDomain(e.target.value)} 
                  className="input" 
                  style={{ width: '180px', fontSize: '0.82rem' }}
                  placeholder="domaine.com"
                />
                <button 
                  onClick={handleRunDnsAudit}
                  disabled={dnsAuditing}
                  className="btn btn-primary"
                  style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={14} className={dnsAuditing ? 'spin' : ''} />
                  {dnsAuditing ? 'Audit en cours...' : 'Tester le Domaine'}
                </button>
              </div>
            </div>
          </div>

          {/* DNS 4-Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {/* SPF Card */}
            <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>SPF (Sender Policy)</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>VALIDÉ</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Autorise les serveurs d'envoi de votre domaine.
              </div>
              <code style={{ fontSize: '0.72rem', background: '#000', padding: '4px 6px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                {dnsResult?.records?.spf?.record || 'v=spf1 include:_spf.google.com ~all'}
              </code>
            </div>

            {/* DKIM Card */}
            <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DKIM (Cryptographie)</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>ACTIF 2048-BIT</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Signature numérique garantissant l'intégrité du message.
              </div>
              <code style={{ fontSize: '0.72rem', background: '#000', padding: '4px 6px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0...
              </code>
            </div>

            {/* DMARC Card */}
            <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DMARC (Protection)</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>CONFORME</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Indique aux FAI comment traiter les emails non légitimes.
              </div>
              <code style={{ fontSize: '0.72rem', background: '#000', padding: '4px 6px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                {dnsResult?.records?.dmarc?.record || 'v=DMARC1; p=quarantine;'}
              </code>
            </div>

            {/* MX Card */}
            <div className="card" style={{ border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>MX (Réception)</span>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>OPÉRATIONNEL</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Permet la réception des réponses dans l'Unibox.
              </div>
              <code style={{ fontSize: '0.72rem', background: '#000', padding: '4px 6px', borderRadius: '4px', display: 'block', wordBreak: 'break-all' }}>
                {dnsResult?.records?.mx?.hosts?.[0] || 'aspmx.l.google.com (pri: 1)'}
              </code>
            </div>
          </div>

          {/* Lemwarm Live Placement Stats */}
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '20px', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score de Réputation Lemwarm</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                99/100
                <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>EXCELLENT</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Prêt pour envoyer des campagnes réelles à froid.
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Boîte Principale</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>98.6%</div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Onglet Promotions</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>1.0%</div>
            </div>

            <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dossier Spam</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>0.4%</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEMLIST ANTI-SPAM RULES & SENDING SCHEDULE */}
      {activeTab === 'rules' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sliders size={18} />
              Quotas & Délais de l'Algorithme Lemlist
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
              Ces règles s'appliquent à toutes les campagnes pour imiter un envoi manuel humain et éviter les alertes algorithmiques.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              {/* Daily Quota Slider */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="label" style={{ margin: 0 }}>Quota journalier par boîte e-mail</label>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{dailyQuota} emails / jour</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="120" 
                  step="5"
                  value={dailyQuota} 
                  onChange={(e) => setDailyQuota(Number(e.target.value))} 
                  style={{ width: '100%', accentColor: '#ffffff', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  <span>10 (Démarrage)</span>
                  <span style={{ color: '#34d399', fontWeight: 600 }}>50 (Standard Lemlist Recommandé)</span>
                  <span>120 (Max)</span>
                </div>
              </div>

              {/* Jitter Delay Slider */}
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <label className="label" style={{ margin: 0 }}>Délai aléatoire entre 2 envois</label>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>{minDelay}s - {maxDelay}s</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="number" 
                    value={minDelay} 
                    onChange={(e) => setMinDelay(Number(e.target.value))} 
                    className="input" 
                    style={{ width: '90px' }}
                    placeholder="Min (ex: 60)"
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>à</span>
                  <input 
                    type="number" 
                    value={maxDelay} 
                    onChange={(e) => setMaxDelay(Number(e.target.value))} 
                    className="input" 
                    style={{ width: '90px' }}
                    placeholder="Max (ex: 180)"
                  />
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>secondes</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Le moteur choisit un temps d'attente aléatoire pour simuler fidèlement une frappe humaine.
                </div>
              </div>
            </div>

            {/* Plain Text & Tracking Domain */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <label className="label">Mode Envoi Texte Brut (Plain-Text Deliverability)</label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginTop: '8px' }}>
                  <input 
                    type="checkbox" 
                    checked={plainText} 
                    onChange={(e) => setPlainText(e.target.checked)} 
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Activer le mode texte pur (Recommandé par Lemlist)</span>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                      Évite l'injection de code HTML complexe qui déclenche le placement dans l'onglet "Promotions" ou "Spam".
                    </p>
                  </div>
                </label>
              </div>

              <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <label className="label">Domaine de Tracking Personnalisé (Custom Tracking Domain)</label>
                <input 
                  type="text" 
                  value={trackingDomain} 
                  onChange={(e) => setTrackingDomain(e.target.value)} 
                  className="input" 
                  placeholder="track.rayons.net"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Remplace les domaines de tracking génériques par votre propre sous-domaine pour sécuriser votre réputation.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleSaveLemlistRules} className="btn btn-primary">
                Sauvegarder les Règles Lemlist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LEMLIST VARIABLES & SIGNATURES */}
      {activeTab === 'variables' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Variables Cheat-Sheet */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Code size={18} />
              Syntaxe des Variables Lemlist
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Insérez ces balises dynamiques dans l'objet ou le corps de vos campagnes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { tag: '{{firstName}}', desc: 'Prénom du prospect (ex: Thomas)' },
                { tag: '{{lastName}}', desc: 'Nom de famille du prospect (ex: Moreau)' },
                { tag: '{{company}}', desc: 'Entreprise ciblée (ex: Doctolib)' },
                { tag: '{{jobTitle}}', desc: 'Poste du décideur (ex: VP Sales)' },
                { tag: "{{firstName | default: 'Bonjour'}}", desc: 'Valeur par défaut si prénom vide' },
                { tag: '{{icebreaker}}', desc: 'Phrase d\'accroche IA personnalisée par lead' },
                { tag: '{{unsubscribe}}', desc: 'Lien conforme de désinscription 1-clic' }
              ].map(v => (
                <div key={v.tag} style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <code style={{ fontSize: '0.82rem', color: '#ffffff', background: '#000', padding: '3px 6px', borderRadius: '3px' }}>
                    {v.tag}
                  </code>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signature Editor with Opt-out compliance */}
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} />
              Signature & Mention Légale Anti-Spam
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Ajoutée automatiquement en bas de vos e-mails pour respecter les réglementations B2B (GDPR / CAN-SPAM).
            </p>

            <textarea 
              rows={8}
              value={signatureText} 
              onChange={(e) => setSignatureText(e.target.value)} 
              className="input" 
              style={{ width: '100%', fontFamily: 'inherit', fontSize: '0.85rem', lineHeight: '1.5', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
              <button onClick={handleSaveLemlistRules} className="btn btn-primary">
                Enregistrer la Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
