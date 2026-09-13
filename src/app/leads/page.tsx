'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Linkedin, 
  Mail, 
  Trash2, 
  Sparkles, 
  Building2, 
  ShieldCheck,
  FileSpreadsheet,
  X,
  ArrowRight,
  RefreshCw,
  CheckCheck
} from 'lucide-react';
import Link from 'next/link';
import { useCrm } from '@/context/CrmContext';
import { Lead } from '@/types';

export default function LeadsPage() {
  const { leads, addLead, importLeads, deleteLead, verifyLeadEmail, verifyAllLeads, campaigns } = useCrm();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinderModalOpen, setIsFinderModalOpen] = useState(false);
  const [verifyingLeadId, setVerifyingLeadId] = useState<string | null>(null);
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // New Single Lead Form State
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newLinkedinUrl, setNewLinkedinUrl] = useState('');

  // CSV Import State
  const [csvRawText, setCsvRawText] = useState(
    `Prénom,Nom,Email,Entreprise,Poste,LinkedIn\nClaire,Martin,claire.martin@lemlist.com,lemlist,Head of Inbound,https://linkedin.com/in/claire-martin\nMaxime,Benoit,m.benoit@qonto.com,Qonto,VP Engineering,https://linkedin.com/in/maxime-benoit\nSarah,Lemoine,sarah.l@mirakl.com,Mirakl,Enterprise Account Exec,https://linkedin.com/in/sarah-lemoine`
  );
  const [importCountMessage, setImportCountMessage] = useState<string | null>(null);

  // Lead Finder State (lemleads equivalent)
  const [finderDomain, setFinderDomain] = useState('swile.co');
  const [foundLeads, setFoundLeads] = useState<Partial<Lead>[]>([
    {
      firstName: 'Guillaume',
      lastName: 'Fournier',
      email: 'guillaume.f@swile.co',
      company: 'Swile',
      jobTitle: 'Director of Business Development',
      linkedinUrl: 'https://linkedin.com/in/guillaume-fournier-swile',
      emailVerified: true,
      score: 92
    },
    {
      firstName: 'Astrid',
      lastName: 'Vallet',
      email: 'astrid.vallet@swile.co',
      company: 'Swile',
      jobTitle: 'Chief People Officer',
      linkedinUrl: 'https://linkedin.com/in/astrid-vallet-swile',
      emailVerified: true,
      score: 89
    }
  ]);

  // Filtered leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(search.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(search.toLowerCase()) ||
      lead.company.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddSingleLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newFirstName) return;

    addLead({
      firstName: newFirstName,
      lastName: newLastName,
      email: newEmail,
      company: newCompany || 'Non renseigné',
      jobTitle: newJobTitle || 'Décideur',
      linkedinUrl: newLinkedinUrl,
      tags: ['Ajout Manuel']
    });

    setIsAddModalOpen(false);
    setNewFirstName('');
    setNewLastName('');
    setNewEmail('');
    setNewCompany('');
    setNewJobTitle('');
    setNewLinkedinUrl('');
  };

  const handleParseAndImportCsv = () => {
    try {
      const lines = csvRawText.trim().split('\n');
      if (lines.length <= 1) return;

      const parsed: Partial<Lead>[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 3) {
          parsed.push({
            firstName: parts[0] || 'Contact',
            lastName: parts[1] || '',
            email: parts[2] || '',
            company: parts[3] || 'Entreprise',
            jobTitle: parts[4] || 'Décideur',
            linkedinUrl: parts[5] || '',
            tags: ['Import CSV Lemlist']
          });
        }
      }

      const count = importLeads(parsed);
      setImportCountMessage(`${count} prospects importés avec succès et vérifiés !`);
      setTimeout(() => {
        setImportCountMessage(null);
        setIsImportModalOpen(false);
      }, 2000);
    } catch (err) {
      alert('Format CSV invalide');
    }
  };

  const handleAddFoundLeads = () => {
    importLeads(foundLeads);
    setIsFinderModalOpen(false);
  };

  const handleBatchVerify = async () => {
    setIsBatchVerifying(true);
    setBatchNotice(null);
    try {
      const res = await verifyAllLeads();
      setBatchNotice(`${res.verified} contacts audités : ${res.valid} valides, ${res.risky} risqués, ${res.invalid} invalides.`);
      setTimeout(() => setBatchNotice(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsBatchVerifying(false);
    }
  };

  const handleVerifySingle = async (leadId: string) => {
    setVerifyingLeadId(leadId);
    try {
      await verifyLeadEmail(leadId);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingLeadId(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '6px' }}>
            Base de Prospects & Enrichissement
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            Gérez vos listes de contacts cibles, vérifiez la délivrabilité de leurs emails et importez vos fichiers CSV.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleBatchVerify} 
            disabled={isBatchVerifying || leads.length === 0} 
            className="btn btn-secondary"
            title="Vérifier tous les emails de la base"
          >
            {isBatchVerifying ? (
              <>
                <RefreshCw size={15} className="spin" />
                Vérification...
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                Vérifier les Emails
              </>
            )}
          </button>
          <Link href="/verifier" className="btn btn-secondary">
            Outil Dédié
          </Link>
          <button onClick={() => setIsFinderModalOpen(true)} className="btn btn-secondary">
            <Sparkles size={16} color="#ffffff" />
            Lead Finder
          </button>
          <button onClick={() => setIsImportModalOpen(true)} className="btn btn-secondary">
            <Upload size={16} />
            Importer CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
            <Plus size={16} />
            Ajouter Prospect
          </button>
        </div>
      </div>

      {batchNotice && (
        <div style={{ padding: '12px 16px', background: '#ffffff', color: '#000000', fontWeight: 700, fontSize: '0.85rem', marginBottom: '20px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} color="#000000" />
          {batchNotice}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
          <input 
            type="text" 
            placeholder="Filtrer par nom, email, entreprise..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '38px', height: '38px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Statut :</span>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select"
            style={{ width: 'auto', padding: '6px 14px', height: '38px' }}
          >
            <option value="all">Tous ({leads.length})</option>
            <option value="new">Nouveaux</option>
            <option value="in_progress">En séquence</option>
            <option value="replied">Ayant répondu</option>
            <option value="converted">Convertis (RDV)</option>
          </select>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Contact & Entreprise</th>
              <th>Poste</th>
              <th>Canaux de Contact</th>
              <th>Statut Outreach</th>
              <th>Score Délivrabilité</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '4px',
                      background: '#000000',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      {lead.firstName[0]}{lead.lastName[0] || ''}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#ffffff' }}>
                        {lead.firstName} {lead.lastName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={11} /> {lead.company}
                      </div>
                    </div>
                  </div>
                </td>

                <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {lead.jobTitle}
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <a 
                      href={`mailto:${lead.email}`}
                      title={lead.email}
                      className="badge"
                      style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                    >
                      <Mail size={11} /> {lead.email.split('@')[1]}
                    </a>
                    {lead.linkedinUrl && (
                      <a 
                        href={lead.linkedinUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="badge"
                        style={{ padding: '2px 8px', fontSize: '0.68rem' }}
                      >
                        <Linkedin size={11} /> Profil
                      </a>
                    )}
                  </div>
                </td>

                <td>
                  <span className="badge" style={{ fontSize: '0.68rem' }}>
                    {lead.status === 'replied' ? 'A répondu' :
                     lead.status === 'in_progress' ? 'En séquence' :
                     lead.status === 'converted' ? 'Rdv réservé' : 'Non contacté'}
                  </span>
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={14} color="#ffffff" />
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.88rem', fontFamily: 'Space Grotesk' }}>
                      {lead.score}%
                    </span>
                    <span className="badge" style={{
                      fontSize: '0.65rem',
                      background: lead.emailStatus === 'valid' || lead.emailVerified ? '#ffffff' : '#000000',
                      color: lead.emailStatus === 'valid' || lead.emailVerified ? '#000000' : '#ffffff',
                      border: '1px solid #ffffff'
                    }}>
                      {lead.emailStatus === 'invalid' ? 'Invalide' :
                       lead.emailStatus === 'risky' ? 'Risqué' : 'Valide'}
                    </span>
                  </div>
                </td>

                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleVerifySingle(lead.id)}
                      disabled={verifyingLeadId === lead.id}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 8px' }}
                      title="Vérifier la validité de cet email"
                    >
                      {verifyingLeadId === lead.id ? (
                        <RefreshCw size={13} className="spin" color="#ffffff" />
                      ) : (
                        <CheckCheck size={13} color="#ffffff" />
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        if (confirm(`Supprimer ${lead.firstName} ${lead.lastName} ?`)) {
                          deleteLead(lead.id);
                        }
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 8px' }}
                      title="Supprimer le prospect"
                    >
                      <Trash2 size={13} color="#ffffff" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredLeads.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Aucun prospect trouvé pour cette recherche.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: CSV IMPORT WIZARD */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={22} color="#818cf8" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Importation CSV & Détection de Colonnes</h2>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Collez vos données CSV ou listes exportées de LinkedIn Sales Navigator. Les colonnes seront mappées automatiquement :
            </p>

            <textarea 
              rows={8}
              value={csvRawText}
              onChange={(e) => setCsvRawText(e.target.value)}
              className="textarea"
              style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '16px' }}
            />

            {importCountMessage && (
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                {importCountMessage}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary">
                Annuler
              </button>
              <button onClick={handleParseAndImportCsv} className="btn btn-primary">
                Importer & Vérifier les Emails
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SINGLE PROSPECT */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Nouveau Prospect</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSingleLead} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Prénom *</label>
                  <input 
                    type="text" 
                    value={newFirstName} 
                    onChange={(e) => setNewFirstName(e.target.value)} 
                    className="input" 
                    required 
                  />
                </div>
                <div>
                  <label className="label">Nom</label>
                  <input 
                    type="text" 
                    value={newLastName} 
                    onChange={(e) => setNewLastName(e.target.value)} 
                    className="input" 
                  />
                </div>
              </div>

              <div>
                <label className="label">Email Professionnel *</label>
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={(e) => setNewEmail(e.target.value)} 
                  className="input" 
                  placeholder="nom@entreprise.com" 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="label">Entreprise</label>
                  <input 
                    type="text" 
                    value={newCompany} 
                    onChange={(e) => setNewCompany(e.target.value)} 
                    className="input" 
                  />
                </div>
                <div>
                  <label className="label">Poste / Fonction</label>
                  <input 
                    type="text" 
                    value={newJobTitle} 
                    onChange={(e) => setNewJobTitle(e.target.value)} 
                    className="input" 
                  />
                </div>
              </div>

              <div>
                <label className="label">URL Profil LinkedIn</label>
                <input 
                  type="url" 
                  value={newLinkedinUrl} 
                  onChange={(e) => setNewLinkedinUrl(e.target.value)} 
                  className="input" 
                  placeholder="https://linkedin.com/in/..." 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-secondary">
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Enregistrer le prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LEAD FINDER (lemleads) */}
      {isFinderModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="#c084fc" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lead Finder (lemleads)</h2>
              </div>
              <button onClick={() => setIsFinderModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Trouvez des décideurs vérifiés à partir du nom de domaine d'une entreprise cible :
            </p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                value={finderDomain} 
                onChange={(e) => setFinderDomain(e.target.value)} 
                placeholder="ex: swile.co" 
                className="input" 
              />
              <button className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Rechercher
              </button>
            </div>

            {/* Found Leads Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {foundLeads.map((f, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.firstName} {f.lastName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{f.jobTitle} • {f.email}</div>
                  </div>
                  <span className="badge badge-success">
                    <ShieldCheck size={12} /> Email Vérifié (92%)
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsFinderModalOpen(false)} className="btn btn-secondary">
                Fermer
              </button>
              <button onClick={handleAddFoundLeads} className="btn btn-primary">
                Ajouter ces 2 prospects à la base
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
