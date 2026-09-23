'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  ShieldCheck, 
  Lock, 
  Database, 
  Server, 
  CheckCircle2, 
  Radio, 
  Mail, 
  Cpu, 
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function CpanelSettingsPage() {
  const { user } = useAuth();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Paramètres Système & Sécurité</h1>
          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>MAÎTRE DU SYSTÈME</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Configuration globale de l'infrastructure SaaS, base de données Firebase Firestore, routes télécom maîtres et sécurité multi-tenant.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Card 1: Master Admin & Environment */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <ShieldCheck size={20} color="#ffffff" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Super-Administrateurs Déclarés</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
            Les comptes ci-dessous disposent des privilèges complets (accès C-Panel, bypass paywall, gestion des crédits et suppression de comptes). Les clients ordinaires n'ont jamais accès à cette console.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { email: 'danielkiboko218@gmail.com', desc: 'Propriétaire Fondateur - Daniel Kiboko (Maître)' },
              { email: 'crm@rayons.net', desc: 'Email de service administratif CRM Rayons' },
              { email: 'daniel.kiboko@rayons.net', desc: 'Email professionnel Rayons Solutions' }
            ].map((admin, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid var(--border-subtle)', 
                  borderRadius: 'var(--radius-sm)' 
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#ffffff', fontFamily: 'monospace' }}>
                    {admin.email}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                    {admin.desc}
                  </div>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>SUPER-ADMIN</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Infrastructure & Cloud Database */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Database size={20} color="#34d399" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Base de Données Cloud Firestore</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
            Synchronisation en direct des comptes utilisateurs, campagnes et métriques télécoms avec la région européenne / mondiale Google Cloud.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.82rem' }}>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Projet Firebase ID</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px', fontFamily: 'monospace' }}>crmrayonsnet</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Statut de Connexion</div>
              <div style={{ fontWeight: 700, color: '#34d399', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} /> Actif & Synchronisé
              </div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Cloisonnement des Données</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Multi-Tenant Isolé</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Mode d'Authentification</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>Firebase Auth JWT + Sessions</div>
            </div>
          </div>
        </div>

        {/* Card 3: Default Client Quotas & Rules */}
        <div className="card" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <Lock size={20} color="#facc15" />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Règles et Quotas Par Défaut pour les Nouveaux Clients</h2>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
            Paramètres attribués automatiquement lorsqu'un utilisateur s'enregistre via le formulaire d'essai de 7 jours.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Durée d'Essai Gratuit</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#facc15', marginTop: '4px' }}>7 Jours</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Sans carte bancaire</div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Crédits SMS Test Offerts</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>500 SMS</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Pour valider les routes</div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-subtle)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Tarif Mensuel Après Essai</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>30 $ / mois</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', marginTop: '2px' }}>Abonnement Pro illimité</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
