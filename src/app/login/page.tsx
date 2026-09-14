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
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResponse, setForgotResponse] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    if (mode === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Identifiants invalides.');
      }
    } else {
      const res = await register(name, email, password, company || 'Entreprise Client');
      if (!res.success) {
        setErrorMessage(res.error || 'Erreur lors de la création du compte.');
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
        maxWidth: '460px',
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
            width: '46px',
            height: '46px',
            borderRadius: '4px',
            background: '#000000',
            border: '1px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ffffff'
          }}>
            <Layers size={24} />
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '4px' }}>
            CRM RAYONS
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Plateforme SMPP, RCS & Emailing SaaS All-in-One
          </p>
        </div>

        {/* Mode Switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
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
              fontSize: '0.75rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'var(--transition)'
            }}
          >
            Se Connecter
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            style={{
              padding: '8px',
              borderRadius: '2px',
              border: 'none',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? '#000000' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'var(--transition)'
            }}
          >
            Essai 7 Jours
          </button>
        </div>

        {/* Trial info banner in register mode */}
        {mode === 'register' && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.78rem',
            color: '#ffffff',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Clock size={16} />
            <span><strong>7 jours d'essai gratuit</strong> sans carte bancaire. Puis 30 $/mois.</span>
          </div>
        )}

        {/* Error message alert */}
        {errorMessage && (
          <div style={{
            padding: '10px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
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
          {mode === 'register' && (
            <>
              <div>
                <label className="label">Nom et Prénom *</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: Alex Dupont"
                    className="input"
                    style={{ paddingLeft: '36px' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Nom de votre Entreprise</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input 
                    type="text" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="ex: Acme Corp"
                    className="input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="label">Email Professionnel *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@entreprise.com"
                className="input"
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <label className="label" style={{ margin: 0 }}>Mot de Passe *</label>
              {mode === 'login' && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Mot de passe oublié ?
                </button>
              )}
            </div>
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
            style={{ width: '100%', height: '44px', marginTop: '4px' }}
          >
            {isSubmitting ? (
              'Traitement en cours...'
            ) : mode === 'login' ? (
              <>Connexion <ArrowRight size={15} /></>
            ) : (
              <>Démarrer mon Essai Gratuit (7j) <ArrowRight size={15} /></>
            )}
          </button>
        </form>

        {/* 1-Click Quick Login for Super-Admin */}
        {mode === 'login' && (
          <div style={{ marginTop: '14px' }}>
            <button
              type="button"
              onClick={async () => {
                setEmail('danielkiboko218@gmail.com');
                setPassword('RayonsAdmin2026!');
                setIsSubmitting(true);
                setErrorMessage(null);
                const res = await login('danielkiboko218@gmail.com', 'RayonsAdmin2026!');
                if (!res.success) {
                  setErrorMessage(res.error || 'Erreur de connexion');
                }
                setIsSubmitting(false);
              }}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-sm)',
                color: '#ffffff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={14} />
              Connexion 1-Clic : Daniel Kiboko (Super-Admin)
            </button>
          </div>
        )}

        {/* Security badge footer */}
        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          <ShieldCheck size={13} />
          Accès SaaS Sécurisé & Données Cloisonnées
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', border: '1px solid #ffffff', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} />
              Récupération de Mot de Passe
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Entrez votre adresse email pour recevoir les instructions de réinitialisation.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              if (forgotEmail.toLowerCase().includes('danielkiboko') || forgotEmail.toLowerCase().includes('rayons.net')) {
                setForgotResponse('Votre clé maître Super-Admin de secours est : RayonsAdmin2026! Vous pouvez également vous connecter via le bouton "Connexion 1-Clic".');
              } else {
                setForgotResponse('Demande enregistrée. Si votre compte existe, votre administrateur (Daniel Kiboko : danielkiboko218@gmail.com) peut réinitialiser votre mot de passe depuis le C-Panel.');
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label">Votre Email</label>
                <input 
                  type="email" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  placeholder="nom@entreprise.com" 
                  className="input" 
                  required 
                />
              </div>

              {forgotResponse && (
                <div style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  lineHeight: '1.4',
                  color: '#ffffff'
                }}>
                  {forgotResponse}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowForgotModal(false); setForgotResponse(null); }} 
                  className="btn btn-secondary"
                >
                  Fermer
                </button>
                <button type="submit" className="btn btn-primary">
                  Vérifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
