'use client';

import React, { useState } from 'react';
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
  Sparkles, 
  Key, 
  ArrowRight,
  Globe,
  Settings
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { EmailAccount } from '@/types';

export default function EmailAccountsPage() {
  const { emailAccounts, addEmailAccount, updateEmailAccount, deleteEmailAccount, setDefaultEmailAccount, testEmailAccount } = useCrm();

  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testingAccountId, setTestingAccountId] = useState<string | null>(null);
  const [testNotice, setTestNotice] = useState<{ id: string; success: boolean; message: string } | null>(null);

  // Form State
  const [provider, setProvider] = useState<'hostinger' | 'google' | 'microsoft' | 'custom'>('google');
  const [name, setName] = useState('Daniel Kiboko | Gmail');
  const [email, setEmail] = useState('danielkiboko218@gmail.com');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSecure, setSmtpSecure] = useState(true);
  const [smtpUser, setSmtpUser] = useState('danielkiboko218@gmail.com');
  const [smtpPass, setSmtpPass] = useState('');
  const [imapHost, setImapHost] = useState('imap.gmail.com');
  const [imapPort, setImapPort] = useState(993);
  const [imapSecure, setImapSecure] = useState(true);
  const [isDefault, setIsDefault] = useState(true);

  const handleSelectProviderPreset = (p: 'hostinger' | 'google' | 'microsoft' | 'custom') => {
    setProvider(p);
    if (p === 'hostinger') {
      setSmtpHost('smtp.hostinger.com');
      setSmtpPort(465);
      setSmtpSecure(true);
      setImapHost('imap.hostinger.com');
      setImapPort(993);
      setImapSecure(true);
    } else if (p === 'google') {
      setSmtpHost('smtp.gmail.com');
      setSmtpPort(465);
      setSmtpSecure(true);
      setImapHost('imap.gmail.com');
      setImapPort(993);
      setImapSecure(true);
    } else if (p === 'microsoft') {
      setSmtpHost('smtp.office365.com');
      setSmtpPort(587);
      setSmtpSecure(false);
      setImapHost('outlook.office365.com');
      setImapPort(993);
      setImapSecure(true);
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
      imapSecure,
      imapUser: smtpUser,
      imapPass: smtpPass,
      status: 'untested',
      isDefault
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Comptes E-mail & Envoi Professionnel</h1>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>SMTP & IMAP LIVE</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Connectez votre messagerie professionnelle (Hostinger, Google Workspace, Outlook) pour envoyer vos campagnes réelles et recevoir les réponses directement dans votre Unibox.
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

      {/* NEW ACCOUNT FORM */}
      {isAddingNew && (
        <div className="card" style={{ marginBottom: '32px', borderColor: 'rgba(255,255,255,0.25)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Server size={18} />
              Connecter une Boîte E-mail Professionnelle
            </h2>
          </div>

          {/* Provider Presets */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label" style={{ marginBottom: '10px' }}>Fournisseur de messagerie</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              {[
                { id: 'hostinger', label: 'Hostinger Mail', sub: 'smtp.hostinger.com' },
                { id: 'google', label: 'Google Workspace', sub: 'Gmail / App Password' },
                { id: 'microsoft', label: 'Microsoft 365', sub: 'Exchange / Outlook' },
                { id: 'custom', label: 'SMTP Personnalisé', sub: 'Serveur dédié / Autre' }
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
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    color: '#ffffff',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '4px' }}>{p.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveAccount} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="label">Nom affiché de l'expéditeur *</label>
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
                <label className="label">Adresse E-mail Professionnelle *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (!smtpUser || smtpUser === email) setSmtpUser(e.target.value);
                  }} 
                  className="input" 
                  placeholder="contact@rayons.net ou crm@rayons.net" 
                  required 
                />
              </div>
            </div>

            {/* SMTP Config */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={15} /> Paramètres SMTP (Envoi d'e-mails)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label className="label">Serveur SMTP Hôte *</label>
                  <input 
                    type="text" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)} 
                    className="input" 
                    placeholder="smtp.hostinger.com" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Port *</label>
                  <input 
                    type="number" 
                    value={smtpPort} 
                    onChange={(e) => setSmtpPort(Number(e.target.value))} 
                    className="input" 
                    placeholder="465" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <label className="label">Chiffrement</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', marginTop: '6px' }}>
                    <input 
                      type="checkbox" 
                      checked={smtpSecure} 
                      onChange={(e) => setSmtpSecure(e.target.checked)} 
                    />
                    SSL / TLS
                  </label>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label className="label">Identifiant / E-mail SMTP *</label>
                  <input 
                    type="text" 
                    value={smtpUser} 
                    onChange={(e) => setSmtpUser(e.target.value)} 
                    className="input" 
                    placeholder="crm@rayons.net" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Mot de passe de messagerie *</label>
                  <input 
                    type="password" 
                    value={smtpPass} 
                    onChange={(e) => setSmtpPass(e.target.value)} 
                    className="input" 
                    placeholder="••••••••••••" 
                    required 
                  />
                </div>
              </div>
            </div>

            {/* IMAP Config for Unibox */}
            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Server size={15} /> Paramètres IMAP (Réception des réponses dans l'Unibox)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px' }}>
                <div>
                  <label className="label">Serveur IMAP Hôte</label>
                  <input 
                    type="text" 
                    value={imapHost} 
                    onChange={(e) => setImapHost(e.target.value)} 
                    className="input" 
                    placeholder="imap.hostinger.com" 
                  />
                </div>
                <div>
                  <label className="label">Port IMAP</label>
                  <input 
                    type="number" 
                    value={imapPort} 
                    onChange={(e) => setImapPort(Number(e.target.value))} 
                    className="input" 
                    placeholder="993" 
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input 
                  type="checkbox" 
                  checked={isDefault} 
                  onChange={(e) => setIsDefault(e.target.checked)} 
                />
                Définir comme compte d'envoi par défaut pour toutes les campagnes
              </label>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setIsAddingNew(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer ce Compte
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ACCOUNTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {emailAccounts.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <Mail size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Aucun compte e-mail connecté</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 20px' }}>
              Connectez votre adresse e-mail professionnelle pour commencer à envoyer vos campagnes d'outreach personnalisées.
            </p>
            <button onClick={() => setIsAddingNew(true)} className="btn btn-primary">
              <Plus size={16} /> Ajouter une Boîte E-mail
            </button>
          </div>
        ) : (
          emailAccounts.map((account) => {
            const isTesting = testingAccountId === account.id;
            const notice = testNotice?.id === account.id ? testNotice : null;

            return (
              <div 
                key={account.id} 
                className="card" 
                style={{ 
                  border: account.isDefault ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{account.name}</span>
                        {account.isDefault && (
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>PAR DÉFAUT</span>
                        )}
                        <span className="badge" style={{ textTransform: 'uppercase', fontSize: '0.68rem', background: 'rgba(255,255,255,0.08)' }}>
                          {account.provider}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {account.email}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Status Badge */}
                    {account.status === 'connected' ? (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={13} /> SMTP Validé
                      </span>
                    ) : account.status === 'error' ? (
                      <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <AlertCircle size={13} /> Erreur SMTP
                      </span>
                    ) : (
                      <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
                        Non testé
                      </span>
                    )}

                    {/* Test Button */}
                    <button
                      onClick={() => handleRunTest(account.id)}
                      disabled={isTesting}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {isTesting ? (
                        <>
                          <RefreshCw size={14} className="spin" />
                          Test SMTP...
                        </>
                      ) : (
                        <>
                          <RefreshCw size={14} />
                          Tester la Connexion
                        </>
                      )}
                    </button>

                    {!account.isDefault && (
                      <button
                        onClick={() => setDefaultEmailAccount(account.id)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                        title="Définir comme compte principal"
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

                {/* Technical Configuration Summary */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Hôte SMTP : </span>
                    <span style={{ fontFamily: 'monospace' }}>{account.smtpHost}:{account.smtpPort}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Chiffrement : </span>
                    <span>{account.smtpSecure ? 'SSL (Port 465)' : 'STARTTLS (Port 587)'}</span>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>IMAP Unibox : </span>
                    <span style={{ fontFamily: 'monospace' }}>{account.imapHost ? `${account.imapHost}:${account.imapPort || 993}` : 'Désactivé'}</span>
                  </div>
                </div>

                {/* Test Feedback Notice */}
                {notice && (
                  <div style={{
                    marginTop: '12px',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: notice.success ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${notice.success ? '#10b981' : '#ef4444'}`,
                    color: notice.success ? '#34d399' : '#f87171'
                  }}>
                    {notice.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{notice.message}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Help & Best Practice Guide Card */}
      <div className="card" style={{ marginTop: '36px', background: 'rgba(255,255,255,0.015)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} />
          Guide de Configuration pour Hostinger & Google Workspace
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Pour votre adresse Hostinger (ex: crm@rayons.net)</div>
            <p>
              Renseignez votre mot de passe de boîte e-mail créé sur hPanel. Le serveur SMTP d'Hostinger est <strong style={{ color: '#fff' }}>smtp.hostinger.com</strong> sur le port <strong style={{ color: '#fff' }}>465</strong> avec SSL activé.
            </p>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>Pour Google Workspace ou Gmail</div>
            <p>
              Google requiert la génération d'un <strong>Mot de passe d'application</strong> (16 caractères) dans les paramètres de sécurité de votre compte Google (Validation en 2 étapes requise).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
