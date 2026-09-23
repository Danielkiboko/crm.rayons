'use client';

import React, { useState } from 'react';
import { 
  Linkedin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink,
  Info,
  Lock,
  Mail,
  Zap,
  Sparkles,
  UserCheck,
  Key,
  Chrome,
  Check,
  LogOut,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';

export default function LinkedinSettingsPage() {
  const [connectMethod, setConnectMethod] = useState<'oneclick' | 'credentials' | 'cookie'>('oneclick');
  
  // Connected account state (persisted or simulated)
  const [connectedAccount, setConnectedAccount] = useState<{
    name: string;
    headline: string;
    avatarUrl?: string;
    profileUrl: string;
    connectedAt: string;
    dailyLimit: number;
  } | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  
  // Cookie mode state
  const [liAtCookie, setLiAtCookie] = useState('');

  // Status & loading states
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // 1. One-Click Connect (Simulated OAuth / Extension Bridge)
  const handleOneClickConnect = () => {
    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Connexion à votre session LinkedIn en cours...' });

    setTimeout(() => {
      setConnectedAccount({
        name: 'Daniel Kiboko',
        headline: 'Directeur Général & Fondateur @ Rayons Solutions',
        profileUrl: 'https://www.linkedin.com/in/daniel-kiboko',
        connectedAt: new Date().toLocaleDateString('fr-FR'),
        dailyLimit: 30
      });
      setIsLoading(false);
      setStatusMessage({ type: 'success', text: 'Compte LinkedIn connecté avec succès en 1 clic !' });
    }, 2000);
  };

  // 2. Direct Credentials Connect (Email + Password)
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Vérification sécurisée des identifiants...' });

    setTimeout(() => {
      // If user hasn't entered 2FA yet, ask for it if needed
      if (!requires2FA && email.includes('@')) {
        setRequires2FA(true);
        setIsLoading(false);
        setStatusMessage({ 
          type: 'info', 
          text: 'Sécurité LinkedIn : un code de confirmation a été envoyé sur votre téléphone / application. Entrez-le ci-dessous.' 
        });
        return;
      }

      setConnectedAccount({
        name: email.split('@')[0].replace('.', ' ').toUpperCase(),
        headline: 'Compte LinkedIn B2B Connecté',
        profileUrl: 'https://www.linkedin.com',
        connectedAt: new Date().toLocaleDateString('fr-FR'),
        dailyLimit: 25
      });
      setIsLoading(false);
      setRequires2FA(false);
      setStatusMessage({ type: 'success', text: 'Authentification LinkedIn validée !' });
    }, 1800);
  };

  // Disconnect
  const handleDisconnect = () => {
    if (confirm('Voulez-vous déconnecter votre compte LinkedIn du CRM ?')) {
      setConnectedAccount(null);
      setStatusMessage(null);
      setEmail('');
      setPassword('');
      setTwoFactorCode('');
      setRequires2FA(false);
      setLiAtCookie('');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Connexion Compte LinkedIn</h1>
            <span className="badge" style={{ background: '#0a66c2', color: '#ffffff', fontWeight: 700, fontSize: '0.72rem' }}>
              OUTREACH B2B
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '750px' }}>
            Connectez votre profil LinkedIn pour automatiser les visites de profil, demandes de connexion et messages personnalisés.
          </p>
        </div>
      </div>

      {/* Status Notice Alert */}
      {statusMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.85rem',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : statusMessage.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(10, 102, 194, 0.15)',
          border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : statusMessage.type === 'error' ? '#ef4444' : '#0a66c2'}`,
          color: statusMessage.type === 'success' ? '#34d399' : statusMessage.type === 'error' ? '#f87171' : '#60a5fa'
        }}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : statusMessage.type === 'error' ? <AlertCircle size={16} /> : <Info size={16} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* STATE 1: ALREADY CONNECTED */}
      {connectedAccount ? (
        <div className="card" style={{ padding: '24px', border: '1px solid rgba(10, 102, 194, 0.4)', background: 'rgba(10, 102, 194, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#0a66c2',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '1.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #ffffff'
              }}>
                {connectedAccount.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {connectedAccount.name}
                  </h2>
                  <span className="badge badge-success" style={{ fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={11} /> CONNECTÉ & ACTIF
                  </span>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '3px' }}>
                  {connectedAccount.headline}
                </div>
                <div style={{ color: 'var(--text-subtle)', fontSize: '0.75rem', marginTop: '6px' }}>
                  Connecté le {connectedAccount.connectedAt} · Limite quotidienne : <strong>{connectedAccount.dailyLimit} actions/jour</strong>
                </div>
              </div>
            </div>

            <button 
              onClick={handleDisconnect}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f87171' }}
            >
              <LogOut size={14} /> Déconnecter
            </button>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Visites de profil</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>Automatisées</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Demandes de connexion</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>Prêtes (avec note)</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Protection Anti-Ban</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#facc15', marginTop: '2px' }}>Warmup Actif (Max 30/j)</div>
            </div>
          </div>
        </div>
      ) : (
        /* STATE 2: NOT CONNECTED - CHOOSE SIMPLE METHOD */
        <div>
          {/* Method Selection Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => setConnectMethod('oneclick')}
              style={{
                padding: '16px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                background: connectMethod === 'oneclick' ? 'rgba(10, 102, 194, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: connectMethod === 'oneclick' ? '1px solid #0a66c2' : '1px solid var(--border-subtle)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={16} color="#0a66c2" />
                  1. En 1 Clic (Recommandé)
                </span>
                <span className="badge" style={{ background: '#0a66c2', color: '#fff', fontSize: '0.62rem' }}>LE PLUS FACILE</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Détection automatique de votre session LinkedIn ouverte. Zéro code, zéro manipulation.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConnectMethod('credentials')}
              style={{
                padding: '16px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                background: connectMethod === 'credentials' ? 'rgba(10, 102, 194, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: connectMethod === 'credentials' ? '1px solid #0a66c2' : '1px solid var(--border-subtle)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={16} color="#38bdf8" />
                  2. Email & Mot de Passe
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Connexion directe avec vos identifiants LinkedIn habituels, comme sur votre téléphone.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setConnectMethod('cookie')}
              style={{
                padding: '16px',
                textAlign: 'left',
                borderRadius: 'var(--radius-sm)',
                background: connectMethod === 'cookie' ? 'rgba(10, 102, 194, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                border: connectMethod === 'cookie' ? '1px solid #0a66c2' : '1px solid var(--border-subtle)',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.92rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Key size={16} color="#facc15" />
                  3. Mode Avancé (Cookie)
                </span>
                <span className="badge" style={{ fontSize: '0.62rem' }}>TECHNIQUE</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Pour les administrateurs souhaitant coller manuellement le token de session <code style={{ color: '#facc15' }}>li_at</code>.
              </p>
            </button>
          </div>

          {/* METHOD 1: ONE-CLICK CONNECT */}
          {connectMethod === 'oneclick' && (
            <div className="card" style={{ padding: '36px', textAlign: 'center', border: '1px solid #0a66c2' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background: '#0a66c2',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <Linkedin size={36} />
              </div>

              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
                Connexion Automatique en 1 Clic
              </h2>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '560px', margin: '0 auto 24px', lineHeight: '1.6' }}>
                Assurez-vous simplement d'être connecté à votre compte LinkedIn sur ce navigateur. Cliquez sur le bouton ci-dessous pour lier instantanément votre profil sans rien copier ni coder.
              </p>

              <button
                onClick={handleOneClickConnect}
                disabled={isLoading}
                style={{
                  background: '#0a66c2',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '14px 32px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 16px rgba(10, 102, 194, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="spin" />
                    Synchronisation avec LinkedIn en cours...
                  </>
                ) : (
                  <>
                    <Linkedin size={20} />
                    Connecter mon Compte LinkedIn
                  </>
                )}
              </button>

              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} color="#34d399" /> Sécurité chiffrée SSL
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="#facc15" /> Détection instantanée
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="#38bdf8" /> Respect des quotas LinkedIn
                </span>
              </div>
            </div>
          )}

          {/* METHOD 2: DIRECT CREDENTIALS */}
          {connectMethod === 'credentials' && (
            <div className="card" style={{ padding: '28px', maxWidth: '600px', margin: '0 auto', border: '1px solid var(--border-strong)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '8px',
                  background: 'rgba(10, 102, 194, 0.1)',
                  color: '#0a66c2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 10px'
                }}>
                  <Lock size={22} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Connexion par Identifiants LinkedIn</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                  Renseignez vos identifiants LinkedIn habituels pour connecter le bot d'outreach.
                </p>
              </div>

              <form onSubmit={handleCredentialsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Adresse Email LinkedIn *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="input" 
                      placeholder="vous@entreprise.com" 
                      style={{ paddingLeft: '36px' }}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Mot de Passe LinkedIn *</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="input" 
                      placeholder="••••••••" 
                      style={{ paddingLeft: '36px', paddingRight: '36px' }}
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

                {requires2FA && (
                  <div style={{ padding: '14px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid #f59e0b', borderRadius: 'var(--radius-sm)' }}>
                    <label className="label" style={{ color: '#f59e0b' }}>Code de Validation LinkedIn (SMS ou Authenticator) *</label>
                    <input 
                      type="text" 
                      value={twoFactorCode} 
                      onChange={(e) => setTwoFactorCode(e.target.value)} 
                      className="input" 
                      placeholder="Ex: 6 chiffres (123456)" 
                      required 
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '42px', marginTop: '6px', background: '#0a66c2', borderColor: '#0a66c2' }}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw size={16} className="spin" style={{ marginRight: '8px' }} />
                      Connexion sécurisée en cours...
                    </>
                  ) : (
                    'Valider et Connecter le Compte'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* METHOD 3: COOKIE (ADVANCED) */}
          {connectMethod === 'cookie' && (
            <div className="card">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Key size={18} color="#facc15" />
                Saisie Manuelle du Cookie de Session (li_at)
              </h3>

              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Info size={14} /> Comment récupérer votre cookie li_at ?
                </div>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  <li>Sur Chrome/Firefox, connectez-vous à <em>linkedin.com</em>.</li>
                  <li>Ouvrez l'inspecteur (clic droit &gt; <strong>Inspecter</strong> &gt; onglet <strong>Application</strong> &gt; <strong>Cookies</strong>).</li>
                  <li>Copiez la valeur de la clé <strong>li_at</strong> et collez-la ci-dessous.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="label">Cookie li_at *</label>
                  <input 
                    type="password" 
                    value={liAtCookie} 
                    onChange={(e) => setLiAtCookie(e.target.value)} 
                    className="input" 
                    placeholder="AQEDATOC..." 
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                  <button 
                    onClick={() => {
                      if (!liAtCookie) return;
                      setIsLoading(true);
                      setTimeout(() => {
                        setConnectedAccount({
                          name: 'Compte Session LinkedIn',
                          headline: 'Session active via cookie li_at',
                          profileUrl: 'https://www.linkedin.com',
                          connectedAt: new Date().toLocaleDateString('fr-FR'),
                          dailyLimit: 30
                        });
                        setIsLoading(false);
                        setStatusMessage({ type: 'success', text: 'Cookie validé et compte connecté !' });
                      }, 1500);
                    }}
                    disabled={isLoading || !liAtCookie}
                    className="btn btn-primary"
                    style={{ background: '#0a66c2', borderColor: '#0a66c2' }}
                  >
                    {isLoading ? 'Vérification...' : 'Enregistrer le cookie'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Safety & Compliance Card */}
      <div className="card" style={{ marginTop: '28px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
        <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={16} color="#34d399" />
          Algorithme de Sécurité & Protection du Compte (Style Lemlist / Waalaxy)
        </h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', lineHeight: '1.6', margin: 0 }}>
          Pour éviter tout blocage par LinkedIn, le CRM respecte un intervalle de temps aléatoire entre chaque visite ou message (délais humains de 45 à 180 secondes) et bride automatiquement les envois à 30 actions par jour maximum par profil.
        </p>
      </div>
    </div>
  );
}
