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
  FileUp,
  X,
  ArrowRight,
  RefreshCw,
  CheckCheck,
  Check,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { useCrm } from '@/context/CrmContext';
import { Lead } from '@/types';
import { parseExcelOrCsvFile, ParsedLeadResult } from '@/lib/excelParser';

export default function LeadsPage() {
  const { leads, addLead, importLeads, updateLead, deleteLead, verifyLeadEmail, verifyAllLeads, generateIcebreakers, campaigns, cleanAndDeduplicateAllLeads } = useCrm();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isFinderModalOpen, setIsFinderModalOpen] = useState(false);
  const [verifyingLeadId, setVerifyingLeadId] = useState<string | null>(null);
  const [isBatchVerifying, setIsBatchVerifying] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // Deduplication & Phone cleaning state
  const [dedupeNotice, setDedupeNotice] = useState<{
    open: boolean;
    totalBefore: number;
    totalAfter: number;
    duplicatesRemoved: number;
    cleanedPhones: number;
    creditsSaved: number;
  } | null>(null);
  
  const [isGeneratingIcebreakers, setIsGeneratingIcebreakers] = useState(false);
  const [editingIcebreakerLead, setEditingIcebreakerLead] = useState<Lead | null>(null);
  const [tempIcebreaker, setTempIcebreaker] = useState('');

  // Excel & File Import State
  const [importMode, setImportMode] = useState<'excel' | 'paste'>('excel');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedExcelResult, setParsedExcelResult] = useState<ParsedLeadResult | null>(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [autoVerifyOnImport, setAutoVerifyOnImport] = useState(true);
  const [autoDedupeOnImport, setAutoDedupeOnImport] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setIsParsingExcel(true);
    setParseError(null);
    try {
      const result = await parseExcelOrCsvFile(file);
      setParsedExcelResult(result);
    } catch (err: any) {
      setParseError(err.message || 'Erreur lors de la lecture du fichier');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleConfirmExcelImport = () => {
    if (!parsedExcelResult || parsedExcelResult.leads.length === 0) return;
    const count = importLeads(parsedExcelResult.leads, {
      checkPhone: autoDedupeOnImport,
      checkEmail: autoDedupeOnImport,
      normalizePhones: true,
      defaultCountryCode: '243'
    });
    setImportCountMessage(`${count} prospects importés et assainis depuis "${uploadedFile?.name || 'le fichier'}" !`);
    if (autoVerifyOnImport) {
      setTimeout(() => {
        handleBatchVerify();
      }, 500);
    }
    setTimeout(() => {
      setImportCountMessage(null);
      setIsImportModalOpen(false);
      setUploadedFile(null);
      setParsedExcelResult(null);
    }, 2000);
  };

  const handleCleanAndDeduplicate = () => {
    const totalBefore = leads.length;
    const report = cleanAndDeduplicateAllLeads({
      checkPhone: true,
      checkEmail: true,
      normalizePhones: true,
      defaultCountryCode: '243'
    });
    setDedupeNotice({
      open: true,
      totalBefore,
      totalAfter: report.uniqueCount,
      duplicatesRemoved: report.duplicatesRemoved.length,
      cleanedPhones: report.cleanedPhonesCount,
      creditsSaved: report.estimatedSmsCreditsSaved
    });
    setTimeout(() => {
      setDedupeNotice(prev => prev ? { ...prev, open: false } : null);
    }, 10000);
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

  const handleGenerateIcebreakers = async () => {
    setIsGeneratingIcebreakers(true);
    setBatchNotice(null);
    try {
      const idsWithoutIcebreaker = filteredLeads.filter(l => !l.icebreaker).map(l => l.id);
      if (idsWithoutIcebreaker.length === 0) {
        setBatchNotice("Tous les contacts visibles ont déjà un Icebreaker !");
        setIsGeneratingIcebreakers(false);
        setTimeout(() => setBatchNotice(null), 3000);
        return;
      }
      await generateIcebreakers(idsWithoutIcebreaker);
      setBatchNotice(`${idsWithoutIcebreaker.length} Icebreakers générés par l'IA !`);
      setTimeout(() => setBatchNotice(null), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingIcebreakers(false);
    }
  };

  const handleSaveIcebreaker = () => {
    if (editingIcebreakerLead) {
      updateLead(editingIcebreakerLead.id, { icebreaker: tempIcebreaker });
      setEditingIcebreakerLead(null);
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
            onClick={handleGenerateIcebreakers} 
            disabled={isGeneratingIcebreakers || leads.length === 0} 
            className="btn btn-secondary"
            title="Générer des phrases d'accroche par IA pour les contacts affichés"
          >
            {isGeneratingIcebreakers ? (
              <>
                <RefreshCw size={15} className="spin" color="#c084fc" />
                Génération...
              </>
            ) : (
              <>
                <Sparkles size={16} color="#c084fc" />
                Icebreakers IA
              </>
            )}
          </button>
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
          <button 
            onClick={handleCleanAndDeduplicate} 
            disabled={leads.length === 0} 
            className="btn btn-secondary"
            title="Formater les numéros au standard international (+243) et supprimer les doublons pour économiser vos crédits SMS"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} color="#34d399" />
            Anti-Doublon & Tél (+243)
          </button>
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

      {dedupeNotice?.open && (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid #10b981',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000000'
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                Nettoyage & Déduplication Télécom terminés avec succès !
              </div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.85)', marginTop: '2px' }}>
                <strong>{dedupeNotice.duplicatesRemoved}</strong> doublon(s) éliminé(s) ({dedupeNotice.creditsSaved} crédits SMS économisés) · 
                <strong> {dedupeNotice.cleanedPhones}</strong> numéro(s) converti(s) au standard international (+243 E.164) · 
                Base assainie : <strong>{dedupeNotice.totalAfter}</strong> contacts uniques restants.
              </div>
            </div>
          </div>
          <button 
            onClick={() => setDedupeNotice(null)} 
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={16} />
          </button>
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
                      onClick={() => {
                        setTempIcebreaker(lead.icebreaker || '');
                        setEditingIcebreakerLead(lead);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '5px 8px', borderColor: lead.icebreaker ? '#c084fc' : 'var(--border-subtle)' }}
                      title={lead.icebreaker ? "Modifier l'Icebreaker IA" : "Ajouter un Icebreaker"}
                    >
                      <Sparkles size={13} color={lead.icebreaker ? "#c084fc" : "#ffffff"} />
                    </button>
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

      {/* MODAL 1: EXCEL & CSV IMPORT WIZARD */}
      {isImportModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileSpreadsheet size={24} color="#ffffff" />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Importer un Fichier de Contacts</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Compatible Excel (.xlsx, .xls), exports LinkedIn, Sales Navigator & CSV</div>
                </div>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
              <button
                type="button"
                onClick={() => setImportMode('excel')}
                className={`btn btn-sm ${importMode === 'excel' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileUp size={14} /> Fichier Excel / CSV
              </button>
              <button
                type="button"
                onClick={() => setImportMode('paste')}
                className={`btn btn-sm ${importMode === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileText size={14} /> Coller du Texte Brut
              </button>
            </div>

            {importMode === 'excel' ? (
              <div>
                {/* Upload Drag & Drop Area */}
                <label 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '36px 20px',
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <input 
                    type="file" 
                    accept=".xlsx,.xls,.csv" 
                    onChange={handleFileUpload} 
                    style={{ display: 'none' }} 
                  />
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '12px'
                  }}>
                    <FileSpreadsheet size={24} color="#ffffff" />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px' }}>
                    {uploadedFile ? uploadedFile.name : 'Cliquez pour sélectionner ou glissez un fichier Excel / CSV'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Fichiers acceptés : .xlsx, .xls, .csv (Export LinkedIn, Waalaxy, Apollo, etc.)
                  </div>
                </label>

                {isParsingExcel && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '20px', color: 'var(--text-muted)' }}>
                    <RefreshCw size={18} className="spin" /> Analyse et détection automatique des colonnes...
                  </div>
                )}

                {parseError && (
                  <div style={{ padding: '12px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: 'var(--radius-md)', color: '#f87171', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {parseError}
                  </div>
                )}

                {/* Parsed Result Summary */}
                {parsedExcelResult && (
                  <div style={{ animation: 'fadeIn 0.2s ease', marginBottom: '20px' }}>
                    <div style={{
                      padding: '14px 16px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          ✅ {parsedExcelResult.leads.length} contacts détectés
                        </span>
                        <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>COLONNES AUTOMATIQUEMENT MAPPÉES</span>
                      </div>

                      {/* Mapping Chips */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.76rem' }}>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          Prénom : <strong>{parsedExcelResult.mappedColumns.firstName || 'Détecté'}</strong>
                        </span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          Nom : <strong>{parsedExcelResult.mappedColumns.lastName || 'Optionnel'}</strong>
                        </span>
                        <span className="badge badge-primary">
                          Email : <strong>{parsedExcelResult.mappedColumns.email || 'Détecté'}</strong>
                        </span>
                        {parsedExcelResult.mappedColumns.phone && (
                          <span className="badge badge-success" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid #34d399' }}>
                            📱 Tél (E.164 +243) : <strong>{parsedExcelResult.mappedColumns.phone}</strong>
                          </span>
                        )}
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          Entreprise : <strong>{parsedExcelResult.mappedColumns.company || 'Détecté'}</strong>
                        </span>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.08)' }}>
                          Fonction : <strong>{parsedExcelResult.mappedColumns.jobTitle || 'Détecté'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Preview Table of First 3 Leads */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                        Aperçu des premiers contacts :
                      </div>
                      <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        <table style={{ width: '100%', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                              <th style={{ padding: '8px 12px' }}>Nom</th>
                              <th style={{ padding: '8px 12px' }}>Email</th>
                              <th style={{ padding: '8px 12px' }}>Téléphone (Formaté E.164)</th>
                              <th style={{ padding: '8px 12px' }}>Entreprise</th>
                              <th style={{ padding: '8px 12px' }}>Poste</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedExcelResult.leads.slice(0, 3).map((lead, idx) => (
                              <tr key={idx} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '8px 12px', fontWeight: 600 }}>{lead.firstName} {lead.lastName}</td>
                                <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{lead.email || '—'}</td>
                                <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: lead.phone ? '#34d399' : 'var(--text-subtle)' }}>
                                  {lead.phone || '—'}
                                </td>
                                <td style={{ padding: '8px 12px' }}>{lead.company}</td>
                                <td style={{ padding: '8px 12px', color: 'var(--text-muted)' }}>{lead.jobTitle}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                        <input 
                          type="checkbox" 
                          checked={autoDedupeOnImport} 
                          onChange={(e) => setAutoDedupeOnImport(e.target.checked)} 
                        />
                        <span>
                          🛡️ <strong>Éliminer les doublons de numéros et d'emails</strong> (Évite de payer deux fois le même SMS)
                        </span>
                      </label>

                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem' }}>
                        <input 
                          type="checkbox" 
                          checked={autoVerifyOnImport} 
                          onChange={(e) => setAutoVerifyOnImport(e.target.checked)} 
                        />
                        <span>Vérifier automatiquement la délivrabilité des e-mails en direct (RFC 5322 & DNS)</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Collez vos données CSV brutes (avec séparateur virgule ou point-virgule) :
                </p>
                <textarea 
                  rows={7}
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  className="textarea"
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '16px' }}
                />
              </div>
            )}

            {importCountMessage && (
              <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', borderRadius: 'var(--radius-md)', color: '#34d399', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                {importCountMessage}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button onClick={() => setIsImportModalOpen(false)} className="btn btn-secondary">
                Annuler
              </button>
              {importMode === 'excel' ? (
                <button 
                  onClick={handleConfirmExcelImport} 
                  disabled={!parsedExcelResult || parsedExcelResult.leads.length === 0}
                  className="btn btn-primary"
                >
                  Importer {parsedExcelResult ? `${parsedExcelResult.leads.length} Prospects` : ''}
                </button>
              ) : (
                <button onClick={handleParseAndImportCsv} className="btn btn-primary">
                  Importer le CSV
                </button>
              )}
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

      {/* MODAL 4: EDIT ICEBREAKER */}
      {editingIcebreakerLead && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="#c084fc" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Icebreaker IA</h2>
              </div>
              <button onClick={() => setEditingIcebreakerLead(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Phrase d'accroche pour <strong>{editingIcebreakerLead.firstName} {editingIcebreakerLead.lastName}</strong> ({editingIcebreakerLead.company}) :
            </p>

            <textarea 
              rows={4}
              value={tempIcebreaker}
              onChange={(e) => setTempIcebreaker(e.target.value)}
              className="textarea"
              placeholder="Ex: Bonjour, impressionnant parcours..."
              style={{ marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setEditingIcebreakerLead(null)} className="btn btn-secondary">
                Annuler
              </button>
              <button type="button" onClick={handleSaveIcebreaker} className="btn btn-primary" style={{ background: '#c084fc', color: 'white' }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
