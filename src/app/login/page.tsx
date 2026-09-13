'use client';

import React, { useState } from 'react';
import { 
  Layers, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Server
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'request'>('login');
  const [email, setEmail] = useState('crm@rayons.net');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Identifiants invalides ou compte non autorisé.');
      }
    } else {
      // Inscription par code d'invitation sécurisé
      if (inviteCode !== 'RAYONS-2026' && inviteCode !== 'RayonsAdmin2026!') {
        setErrorMessage('Code d\'invitation SaaS invalide. Seul l\'administrateur de rayons.net peut délivrer ce code.');
        setIsSubmitting(false);
        return;
      }

      const res = await register(name, email, password, 'Rayons.net SaaS');
      if (!res.success) {
        setErrorMessage(res.error || 'Erreur lors de la création de l\'accès.');
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#000000',
      padding: '24px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#080808',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.95)',
        padding: '36px',
        position: 'relative'
      }}>
        {/* Brand Header Starlink */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '4px',
            background: '#000000',
            border: '1px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ffffff'
          }}>
            <Layers size={22} />
          </div>

          <h1 style={{ fontSize: '1.4rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '4px' }}>
            LEMFLOW CRM
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Portail Authentifié • Rayons.net
          </p>
        </div>

        {/* Security / Central cPanel Banner */}
        <div style={{
          padding: '10px 14px',
          background: '#000000',
          border: '1px solid var(--border-subtle)',
          borderRadius: '4px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Server size={16} color="#ffffff" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Accès privé SaaS géré de manière centralisée par la passerelle <strong style={{ color: '#ffffff' }}>rayons.net</strong>.
          </div>
        </div>

        {/* Tab switcher: Connexion vs Code d'Invitation */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '4px',
          background: '#000000',
          padding: '4px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            style={{
              padding: '8px',
              borderRadius: '2px',
              border: 'none',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              color: mode === 'login' ? '#000000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'var(--transition)'
            }}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => { setMode('request'); setErrorMessage(null); }}
            style={{
              padding: '8px',
              borderRadius: '2px',
              border: 'none',
              background: mode === 'request' ? '#ffffff' : 'transparent',
              color: mode === 'request' ? '#000000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.72rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              transition: 'var(--transition)'
            }}
          >
            Activer un Code
          </button>
        </div>

        {/* Error message alert */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid #ffffff',
            borderRadius: 'var(--radius-sm)',
            color: '#ffffff',
            fontSize: '0.78rem',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'request' && (
            <>
              <div>
                <label className="label">Nom Complet</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Sarah Laurent"
                    className="input"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Code d'Invitation SaaS Fourni</label>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input 
                    type="text" 
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="RAYONS-XXXX"
                    className="input"
                    style={{ paddingLeft: '36px', fontFamily: 'monospace' }}
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Email Professionnel Autorisé</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@rayons.net"
                className="input"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <label className="label">Mot de Passe</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
                style={{ paddingLeft: '36px', paddingRight: '36px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', height: '42px', marginTop: '4px' }}
          >
            {isSubmitting ? 'Contrôle des accès...' : mode === 'login' ? 'Connexion Sécurisée' : 'Valider mon Accès'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Security Info Footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Vous n'avez pas d'accès ? Contactez l'administrateur :
          </div>
          <a 
            href="mailto:crm@rayons.net"
            style={{ color: '#ffffff', fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none', fontFamily: 'monospace' }}
          >
            crm@rayons.net
          </a>
        </div>

        {/* Security badge footer */}
        <div style={{ marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <ShieldCheck size={13} />
          Contrôle d'accès chiffré TLS 1.3
        </div>
      </div>
    </div>
  );
}
