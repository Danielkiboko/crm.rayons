'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Server
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminEmail } from '@/lib/userStore';
import { auth } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

export default function CpanelLoginPage() {
  const router = useRouter();
  const { login, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Vérification préalable : seuls les emails super-admin autorisés sont admis
    if (!isSuperAdminEmail(cleanEmail)) {
      setIsSubmitting(false);
      setErrorMessage("Accès Refusé : Cette adresse e-mail n'est pas habilitée comme Super-Administrateur cPanel. Pour l'espace de travail CRM standard, veuillez utiliser le portail client.");
      return;
    }

    // 2. Authentification sécurisée
    const res = await login(cleanEmail, password);
    if (!res.success) {
      setIsSubmitting(false);
      setErrorMessage(res.error || 'Identifiants administrateur invalides.');
      return;
    }

    // 3. Redirection vers la console cPanel
    setIsSubmitting(false);
    router.replace('/cpanel/agents');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#030303',
      padding: '24px',
      position: 'relative'
    }}>
      {/* Background radial accent */}
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#090909',
        border: '1px solid rgba(239, 68, 68, 0.4)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 70px rgba(239, 68, 68, 0.15)',
        padding: '36px',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Brand Header cPanel */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '8px',
            background: '#ef4444',
            border: '2px solid #ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)'
          }}>
            <ShieldCheck size={28} />
          </div>

          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '4px' }}>
            cPANEL RAYONS
          </h1>
          <p style={{ fontSize: '0.72rem', color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
            Console d'Administration & Gestion Globale
          </p>
        </div>

        {/* Security Alert Banner */}
        <div style={{
          padding: '10px 14px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.75rem',
          color: '#fca5a5',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Server size={14} style={{ flexShrink: 0 }} />
          <span>Accès strictement réservé au Super-Administrateur système.</span>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            borderRadius: 'var(--radius-sm)',
            color: '#f87171',
            fontSize: '0.8rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Admin Login Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label className="label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
              Email Super-Administrateur
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="danielkiboko218@gmail.com"
                className="input"
                style={{ paddingLeft: '38px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="label" style={{ fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>
                Mot de Passe Maître
              </label>
              <button 
                type="button" 
                onClick={() => setShowForgotModal(true)}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer' }}
              >
                Mot de passe oublié ?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input"
                style={{ paddingLeft: '38px', paddingRight: '38px', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              background: '#ef4444',
              borderColor: '#ef4444',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              'Connexion en cours...'
            ) : (
              <>
                <span>Accéder à la Console cPanel</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Switch to CRM Client portal */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Vous êtes un utilisateur ou client CRM ?
          </p>
          <Link
            href="/login"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem', padding: '8px 0' }}
          >
            <ArrowLeft size={14} style={{ marginRight: '6px' }} />
            Aller sur le Portail CRM Client
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.92)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="card" style={{ maxWidth: '440px', width: '100%', border: '1px solid #ef4444', animation: 'fadeIn 0.2s ease' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={18} color="#ef4444" />
              Récupération Compte Super-Admin
            </h3>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Entrez votre adresse email administrateur pour recevoir un lien de réinitialisation sécurisé.
            </p>

            {forgotError && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                borderRadius: 'var(--radius-sm)',
                color: '#f87171',
                fontSize: '0.8rem',
                marginBottom: '14px'
              }}>
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div style={{
                padding: '10px 14px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                borderRadius: 'var(--radius-sm)',
                color: '#34d399',
                fontSize: '0.8rem',
                marginBottom: '14px'
              }}>
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={async (e) => {
              e.preventDefault();
              setForgotError(null);
              setForgotSuccess(null);

              const clean = forgotEmail.trim().toLowerCase();
              if (!isSuperAdminEmail(clean)) {
                setForgotError("Cette adresse n'est pas un compte Super-Admin.");
                return;
              }

              setIsForgotLoading(true);
              try {
                if (!auth) throw new Error('Firebase non initialisé');
                await sendPasswordResetEmail(auth, clean);
                setForgotSuccess(`Lien de réinitialisation envoyé à ${clean}. Vérifiez vos emails.`);
              } catch (err: any) {
                setForgotError(err.message || 'Erreur lors de l\'envoi');
              } finally {
                setIsForgotLoading(false);
              }
            }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="label">Votre Email Administrateur *</label>
                <input 
                  type="email" 
                  value={forgotEmail} 
                  onChange={(e) => setForgotEmail(e.target.value)} 
                  placeholder="danielkiboko218@gmail.com" 
                  className="input" 
                  required 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => { setShowForgotModal(false); setForgotError(null); setForgotSuccess(null); }} 
                  className="btn btn-secondary"
                >
                  Fermer
                </button>
                <button type="submit" disabled={isForgotLoading} className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>
                  {isForgotLoading ? 'Envoi...' : 'Envoyer le lien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
