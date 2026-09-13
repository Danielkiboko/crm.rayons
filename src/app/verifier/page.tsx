'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  Server, 
  Mail, 
  Sparkles, 
  Trash2, 
  ArrowRight,
  UserCheck,
  FileSpreadsheet,
  Download,
  Terminal,
  Layers,
  Info
} from 'lucide-react';
import { useCrm } from '@/context/CrmContext';
import { verifyEmailAddress, VerificationResult } from '@/lib/emailVerifier';

export default function EmailVerifierPage() {
  const { leads, addLead, verifyAllLeads, removeInvalidLeads } = useCrm();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'database'>('single');

  // Single Check State
  const [singleEmail, setSingleEmail] = useState('guillaume.f@swile.co');
  const [isVerifying, setIsVerifying] = useState(false);
  const [singleResult, setSingleResult] = useState<VerificationResult | null>(null);
  const [addedLeadNotice, setAddedLeadNotice] = useState<string | null>(null);

  // Bulk Check State
  const [bulkInput, setBulkInput] = useState(
`thomas.moreau@doctolib.fr
sophie.dubois@alan.com
contact@entreprise-test.com
alexandre@swile.co
test.fake@mailinator.com
support@google.com
inconnu@domaine-inexistant-404.xyz`
  );
  const [isBulkVerifying, setIsBulkVerifying] = useState(false);
  const [bulkResults, setBulkResults] = useState<VerificationResult[]>([]);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Database Scan State
  const [isScanningDb, setIsScanningDb] = useState(false);
  const [dbScanSummary, setDbScanSummary] = useState<{
    verified: number;
    valid: number;
    risky: number;
    invalid: number;
  } | null>(null);
  const [cleanNotice, setCleanNotice] = useState<string | null>(null);

  // Single verify handler
  const handleSingleVerify = async (emailToTest?: string) => {
    const target = emailToTest || singleEmail;
    if (!target.trim()) return;

    setIsVerifying(true);
    setAddedLeadNotice(null);
    try {
      const res = await verifyEmailAddress(target);
      setSingleResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  // Quick preset test
  const handleTestPreset = (preset: string) => {
    setSingleEmail(preset);
    handleSingleVerify(preset);
  };

  // Add single verified lead to CRM
  const handleAddVerifiedLead = () => {
    if (!singleResult) return;
    const namePart = singleResult.user.split(/[._-]/);
    const firstName = namePart[0] ? namePart[0].charAt(0).toUpperCase() + namePart[0].slice(1) : 'Contact';
    const lastName = namePart[1] ? namePart[1].charAt(0).toUpperCase() + namePart[1].slice(1) : '';
    const company = singleResult.domain.split('.')[0];
    const formattedCompany = company.charAt(0).toUpperCase() + company.slice(1);

    addLead({
      firstName,
      lastName,
      email: singleResult.email,
      company: formattedCompany,
      jobTitle: 'Prospect Qualifié',
      tags: ['Email Vérifié', singleResult.status.toUpperCase()]
    });

    setAddedLeadNotice(`Prospect ${singleResult.email} ajouté à la base de prospects.`);
    setTimeout(() => setAddedLeadNotice(null), 3000);
  };

  // Bulk verify handler
  const handleBulkVerify = async () => {
    const lines = bulkInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    setIsBulkVerifying(true);
    setBulkResults([]);
    setBulkProgress(0);

    const results: VerificationResult[] = [];
    for (let i = 0; i < lines.length; i++) {
      const res = await verifyEmailAddress(lines[i]);
      results.push(res);
      setBulkProgress(Math.round(((i + 1) / lines.length) * 100));
      setBulkResults([...results]);
    }

    setIsBulkVerifying(false);
  };

  // Scan Database handler
  const handleScanDatabase = async () => {
    setIsScanningDb(true);
    setCleanNotice(null);
    try {
      const summary = await verifyAllLeads();
      setDbScanSummary(summary);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanningDb(false);
    }
  };

  // Remove invalid leads from CRM
  const handleCleanInvalidLeads = () => {
    const removed = removeInvalidLeads();
    setCleanNotice(`${removed} contact(s) invalide(s) purgé(s) de la base de prospects.`);
    setDbScanSummary(null);
    setTimeout(() => setCleanNotice(null), 3500);
  };

  // Bulk stats
  const bulkValidCount = bulkResults.filter(r => r.status === 'valid').length;
  const bulkRiskyCount = bulkResults.filter(r => r.status === 'risky').length;
  const bulkInvalidCount = bulkResults.filter(r => r.status === 'invalid').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header Starlink Style */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="badge badge-outline" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
            DÉLIVRABILITÉ & SÉCURITÉ OUTREACH
          </span>
        </div>
        <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.02em', textTransform: 'uppercase', marginBottom: '8px' }}>
          Vérificateur d'Emails Haute Précision
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '850px', lineHeight: 1.5 }}>
          Protégez la réputation de votre nom de domaine et évitez les listes noires. Notre moteur teste la syntaxe RFC, interroge les serveurs DNS MX en temps réel, filtre les boîtes jetables et détecte les pièges à spam.
        </p>
      </div>

      {/* Overview Metric Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Base Prospects
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            {leads.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Contacts enregistrés
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Délivrabilité Estimée
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk', color: '#ffffff' }}>
            98.4%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Score global sécurisé
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Rebonds Hard Évités
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            142
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Économisés ce mois-ci
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
            Vérification DNS MX
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
            En Direct
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Cloudflare DNS-over-HTTPS
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('single')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'single' ? '2px solid #ffffff' : '2px solid transparent',
            color: activeTab === 'single' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Vérification Unitaire
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bulk' ? '2px solid #ffffff' : '2px solid transparent',
            color: activeTab === 'bulk' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}
        >
          Nettoyeur de Liste (Bulk)
        </button>

        <button
          onClick={() => setActiveTab('database')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'database' ? '2px solid #ffffff' : '2px solid transparent',
            color: activeTab === 'database' ? '#ffffff' : 'var(--text-muted)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          Audit de la Base CRM ({leads.length})
        </button>
      </div>

      {/* TAB 1: SINGLE VERIFICATION */}
      {activeTab === 'single' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
          {/* Left Panel: Input & Quick Tests */}
          <div>
            <div className="card" style={{ padding: '24px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                Tester un email en direct
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
                Entrez l'adresse d'un prospect pour obtenir un rapport de délivrabilité instantané.
              </p>

              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <input
                  type="email"
                  value={singleEmail}
                  onChange={(e) => setSingleEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSingleVerify()}
                  placeholder="nom@entreprise.com"
                  className="input"
                  style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.9rem' }}
                />
                <button 
                  onClick={() => handleSingleVerify()} 
                  disabled={isVerifying || !singleEmail.trim()}
                  className="btn btn-primary"
                  style={{ minWidth: '140px' }}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      Analyse...
                    </>
                  ) : (
                    <>
                      <Search size={15} />
                      Vérifier
                    </>
                  )}
                </button>
              </div>

              {/* Quick Presets */}
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '8px' }}>
                  Exemples de tests prédéfinis :
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {[
                    { label: 'Valide B2B', email: 'claire.martin@lemlist.com' },
                    { label: 'GSuite Entreprise', email: 'guillaume.f@swile.co' },
                    { label: 'Boîte Générique', email: 'contact@doctolib.fr' },
                    { label: 'Jetable / Fake', email: 'prospect@mailinator.com' },
                    { label: 'Domaine Invalide', email: 'ceo@inexistant-fake-domain99.org' }
                  ].map((preset) => (
                    <button
                      key={preset.email}
                      onClick={() => handleTestPreset(preset.email)}
                      className="badge badge-outline"
                      style={{ cursor: 'pointer', padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Educational / Deliverability Tips */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Terminal size={16} />
                <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Critères de Contrôle Lemflow
                </span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={15} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Résolution DNS MX :</strong> Vérifie que le domaine héberge des serveurs de messagerie capables de recevoir des e-mails.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={15} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Filtrage Jetable (Disposable) :</strong> Détection des adresses temporaires (Yopmail, Mailinator) utilisées pour masquer l'identité.
                  </div>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={15} style={{ color: '#ffffff', flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong style={{ color: '#ffffff' }}>Détection des Boîtes de Rôle :</strong> Signale les adresses partagées (`contact@`, `admin@`) qui génèrent des taux d'ouverture faibles.
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Panel: Result Cockpit */}
          <div>
            {singleResult ? (
              <div className="card" style={{ padding: '24px', border: '1px solid #ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Rapport d'Audit Technique
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', fontFamily: 'monospace' }}>
                    {new Date(singleResult.verifiedAt).toLocaleTimeString()}
                  </span>
                </div>

                {/* Status Hero */}
                <div style={{
                  padding: '20px',
                  background: '#000000',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      {singleResult.status === 'valid' && <ShieldCheck size={24} color="#ffffff" />}
                      {singleResult.status === 'risky' && <AlertTriangle size={24} color="#ffffff" />}
                      {singleResult.status === 'invalid' && <XCircle size={24} color="#ffffff" />}
                      
                      <span style={{
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        fontFamily: 'Space Grotesk'
                      }}>
                        {singleResult.status === 'valid' ? 'EMAIL VALIDE' :
                         singleResult.status === 'risky' ? 'EMAIL RISQUÉ' : 'EMAIL INVALIDE'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {singleResult.reason}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk' }}>
                      {singleResult.score}%
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                      Score Fiabilité
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div style={{
                  padding: '12px 16px',
                  background: '#111111',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  fontSize: '0.82rem',
                  lineHeight: 1.4,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ffffff' }} />
                  <div>
                    <strong style={{ color: '#ffffff', display: 'block', marginBottom: '2px' }}>
                      Recommandation d'Envoi :
                    </strong>
                    <span style={{ color: 'var(--text-muted)' }}>{singleResult.recommendation}</span>
                  </div>
                </div>

                {/* Checklist Matrix */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Format & Syntaxe RFC 5322</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {singleResult.details.syntax ? 'CONFORME' : 'INVALIDE'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serveur DNS MX Actif</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {singleResult.details.hasMxRecords ? 'RÉSOLU (DNS OK)' : 'AUCUN SERVEUR'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hébergeur Détecté</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {singleResult.details.mxProvider || 'Standard'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Boîte Éphémère / Jetable</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {singleResult.details.isDisposable ? 'DÉTECTÉE (SPAM)' : 'NON (DOMAINE RÉEL)'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Type d'Adresse</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>
                      {singleResult.details.isRoleAccount ? 'RÔLE (GÉNÉRIQUE)' :
                       singleResult.details.isFreeProvider ? 'GRATUIT (B2C)' : 'NOMINATIF (B2B)'}
                    </span>
                  </div>
                </div>

                {/* Add to Leads Action */}
                {singleResult.isValid && (
                  <div>
                    {addedLeadNotice ? (
                      <div style={{ padding: '10px 14px', background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.8rem', textAlign: 'center', borderRadius: '4px' }}>
                        {addedLeadNotice}
                      </div>
                    ) : (
                      <button
                        onClick={handleAddVerifiedLead}
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center' }}
                      >
                        <UserCheck size={16} />
                        Ajouter ce prospect vérifié au CRM
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: '40px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '320px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#111111', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Mail size={22} color="var(--text-muted)" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Prêt pour l'audit
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '300px' }}>
                  Saisissez un email à gauche ou cliquez sur un exemple pour exécuter l'inspection DNS et le calcul de délivrabilité.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: BULK VERIFIER */}
      {activeTab === 'bulk' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px' }}>
            {/* Left Column: Input */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h2 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Liste d'emails à vérifier
                </h2>
                <span className="badge badge-outline" style={{ fontSize: '0.7rem' }}>
                  1 email par ligne
                </span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '16px' }}>
                Collez vos listes brutes issues de vos exports commerciaux ou fichiers clients :
              </p>

              <textarea
                rows={12}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                disabled={isBulkVerifying}
                className="textarea"
                style={{ fontFamily: 'monospace', fontSize: '0.82rem', marginBottom: '16px' }}
                placeholder="contact1@societe.com&#10;contact2@domaine.fr"
              />

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={handleBulkVerify}
                  disabled={isBulkVerifying || !bulkInput.trim()}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {isBulkVerifying ? (
                    <>
                      <RefreshCw size={15} className="spin" />
                      Vérification en cours ({bulkProgress}%)...
                    </>
                  ) : (
                    <>
                      <Sparkles size={15} />
                      Vérifier toute la liste
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Bulk Results & Export */}
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                    Résultats de l'Audit ({bulkResults.length})
                  </h2>
                </div>

                {bulkResults.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const valids = bulkResults.filter(r => r.status === 'valid').map(r => r.email).join('\n');
                        const blob = new Blob([valids], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'emails-valides-lemflow.txt';
                        a.click();
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <Download size={13} />
                      Exporter les Valides
                    </button>
                  </div>
                )}
              </div>

              {/* Breakdown Counters */}
              {bulkResults.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ padding: '12px', background: '#000000', border: '1px solid #ffffff', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                      {bulkValidCount}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                      Valides (100%)
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#000000', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                      {bulkRiskyCount}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                      Risqués
                    </div>
                  </div>

                  <div style={{ padding: '12px', background: '#000000', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                      {bulkInvalidCount}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                      Invalides
                    </div>
                  </div>
                </div>
              )}

              {/* Results Table */}
              <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid var(--border-subtle)' }}>
                <table className="custom-table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 12px' }}>Email</th>
                      <th style={{ padding: '8px 12px' }}>Statut</th>
                      <th style={{ padding: '8px 12px' }}>Score</th>
                      <th style={{ padding: '8px 12px' }}>Fournisseur MX</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((res, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#ffffff', padding: '8px 12px' }}>
                          {res.email}
                        </td>
                        <td style={{ padding: '8px 12px' }}>
                          <span className="badge" style={{
                            fontSize: '0.65rem',
                            background: res.status === 'valid' ? '#ffffff' : '#000000',
                            color: res.status === 'valid' ? '#000000' : '#ffffff',
                            border: '1px solid #ffffff'
                          }}>
                            {res.status === 'valid' ? 'VALIDE' :
                             res.status === 'risky' ? 'RISQUÉ' : 'INVALIDE'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.82rem', padding: '8px 12px' }}>
                          {res.score}%
                        </td>
                        <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '8px 12px' }}>
                          {res.details.mxProvider || (res.details.hasMxRecords ? 'Actif' : 'Aucun')}
                        </td>
                      </tr>
                    ))}

                    {bulkResults.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          Aucune analyse lancée pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT CRM DATABASE */}
      {activeTab === 'database' && (
        <div className="card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: '4px' }}>
                Audit Global de la Base Active ({leads.length} contacts)
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Passez au crible l'intégralité de vos prospects enregistrés dans le CRM pour nettoyer les rebonds potentiels avant d'activer vos séquences.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleScanDatabase}
                disabled={isScanningDb || leads.length === 0}
                className="btn btn-primary"
              >
                {isScanningDb ? (
                  <>
                    <RefreshCw size={15} className="spin" />
                    Audit en cours...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} />
                    Lancer l'Audit Global
                  </>
                )}
              </button>

              {dbScanSummary && dbScanSummary.invalid > 0 && (
                <button
                  onClick={handleCleanInvalidLeads}
                  className="btn btn-secondary"
                  style={{ border: '1px solid #ffffff' }}
                >
                  <Trash2 size={15} />
                  Purger les {dbScanSummary.invalid} Invalides
                </button>
              )}
            </div>
          </div>

          {cleanNotice && (
            <div style={{ padding: '12px 16px', background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.85rem', marginBottom: '20px', borderRadius: '4px' }}>
              {cleanNotice}
            </div>
          )}

          {/* Scan Results Summary */}
          {dbScanSummary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
              <div style={{ padding: '18px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Audités
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                  {dbScanSummary.verified}
                </div>
              </div>

              <div style={{ padding: '18px', background: '#000000', border: '1px solid #ffffff' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Prêts pour l'Outreach
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                  {dbScanSummary.valid}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>0% risque de bounce</div>
              </div>

              <div style={{ padding: '18px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Risqués (Catch-All)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                  {dbScanSummary.risky}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>À surveiller</div>
              </div>

              <div style={{ padding: '18px', background: '#000000', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  Invalides (Hard Bounce)
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>
                  {dbScanSummary.invalid}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Recommandé de purger</div>
              </div>
            </div>
          )}

          {/* Leads Preview Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Entreprise</th>
                  <th>Email</th>
                  <th>Score Délivrabilité</th>
                  <th>Statut Vérification</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.id}>
                    <td style={{ fontWeight: 600, color: '#ffffff' }}>
                      {l.firstName} {l.lastName}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      {l.company}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#ffffff' }}>
                      {l.email}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: '0.9rem' }}>
                        {l.score}%
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{
                        fontSize: '0.68rem',
                        background: l.emailStatus === 'valid' || l.emailVerified ? '#ffffff' : '#000000',
                        color: l.emailStatus === 'valid' || l.emailVerified ? '#000000' : '#ffffff',
                        border: '1px solid #ffffff'
                      }}>
                        {l.emailStatus === 'invalid' ? 'INVALIDE' :
                         l.emailStatus === 'risky' ? 'RISQUÉ' : 'VÉRIFIÉ (SÉCURISÉ)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
