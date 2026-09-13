'use client';

import React from 'react';
import { 
  Lock, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  FileSpreadsheet, 
  Inbox, 
  Flame 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PaywallModal() {
  const { user, trialStatus, upgradeToPro } = useAuth();

  if (!user || !trialStatus.isExpired || trialStatus.isSuperAdmin || trialStatus.isProActive) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.92)',
      backdropFilter: 'blur(10px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        background: '#0a0a0a',
        border: '1px solid #ffffff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.95)',
        padding: '36px 32px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid #ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: '#ffffff'
        }}>
          <Lock size={26} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, marginBottom: '8px', color: '#ffffff' }}>
          Période d'essai de 7 jours expirée
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.5' }}>
          Votre période d'essai gratuite de 7 jours pour <strong>{user.companyName}</strong> est arrivée à échéance. Passez à l'abonnement Pro pour continuer à prospecter.
        </p>

        {/* Pricing Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '24px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#ffffff' }}>Abonnement Pro LemFlow</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facturation mensuelle sans engagement</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: '#ffffff' }}>30 $</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / mois</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            {[
              'Envois d\'e-mails illimités via votre adresse pro (SMTP Hostinger / Google)',
              'Import et auto-mapping de fichiers Excel & exports LinkedIn (.xlsx, .csv)',
              'Vérificateur de délivrabilité RFC 5322 & DNS MX en temps réel',
              'Boîte de réception Unibox avec suivi des réponses et création de Deals',
              'Warmup de délivrabilité et images ultra-personnalisées'
            ].map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={14} color="#10b981" />
                <span style={{ color: '#ffffff' }}>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={upgradeToPro}
          className="btn btn-primary"
          style={{ width: '100%', height: '46px', fontSize: '0.95rem', fontWeight: 700 }}
        >
          Activer mon Abonnement Pro (30 $/mois)
          <ArrowRight size={16} />
        </button>

        <div style={{ marginTop: '18px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Besoin d'une assistance ou d'un délai ? Contactez l'administrateur :{' '}
          <a href="mailto:crm@rayons.net" style={{ color: '#ffffff', textDecoration: 'underline' }}>
            crm@rayons.net
          </a>
        </div>
      </div>
    </div>
  );
}
