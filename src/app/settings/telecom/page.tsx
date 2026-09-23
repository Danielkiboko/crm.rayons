'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Radio, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  ArrowLeft,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { isSuperAdminEmail } from '@/lib/userStore';

export default function TelecomClientStatusPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isSuperAdmin = user?.role === 'superadmin' || isSuperAdminEmail(user?.email);

  useEffect(() => {
    // Super-Admin is redirected to the C-Panel NOC
    if (!isLoading && isSuperAdmin) {
      router.replace('/cpanel/telecom');
    }
  }, [isLoading, isSuperAdmin, router]);

  if (isLoading) {
    return <div style={{ padding: '40px', color: 'var(--text-muted)' }}>Chargement...</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>Réseau Télécom & Crédits (SMS & RCS)</h1>
          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>OPÉRATEURS ACTIFS</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Les routes directes opérateurs (Orange, Vodacom, Google RCS) sont gérées et optimisées de manière centralisée par l'infrastructure CRM Rayons.
        </p>
      </div>

      {/* Credit Balance Card */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--border-strong)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Solde de Crédits SMS Dédié
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', marginTop: '4px' }}>
              {user?.smppCredits ?? 500} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>SMS disponibles</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Prêt pour vos campagnes marketing & outreach
            </div>
          </div>

          <Link href="/campaigns/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Zap size={15} /> Lancer une Campagne SMS / RCS
          </Link>
        </div>
      </div>

      {/* Active Operators Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: 'rgba(249, 115, 22, 0.15)', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Orange Direct SMSC</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Route directe RDC & Afrique</div>
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>DÉBIT 50 SMS/S</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Radio size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Vodacom Gateway</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Passerelle prioritaire</div>
            </div>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>DÉBIT 100 SMS/S</span>
        </div>

        <div className="card" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MessageSquare size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#ffffff' }}>Google RCS RBM</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>Cartes riches interactives</div>
            </div>
          </div>
          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>JIBE CLOUD ACTIF</span>
        </div>
      </div>

      {/* Info Banner */}
      <div className="card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} color="#34d399" />
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Les interconnexions protocolaires et certificats télécoms sont maintenus automatiquement par l'administrateur système.
          </div>
        </div>

        <Link href="/campaigns" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ArrowLeft size={13} /> Retour aux Campagnes
        </Link>
      </div>
    </div>
  );
}
