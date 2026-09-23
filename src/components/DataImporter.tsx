'use client';

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { UploadCloud, CheckCircle2, AlertCircle, X, FileSpreadsheet, ShieldCheck, PhoneCall, Sparkles } from 'lucide-react';
import { Lead } from '@/types';
import { useCrm } from '@/context/CrmContext';
import { deduplicateAndCleanLeads, cleanPhoneNumber } from '@/lib/phoneUtils';

interface DataImporterProps {
  onClose: () => void;
}

export default function DataImporter({ onClose }: DataImporterProps) {
  const { addLead, leads } = useCrm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  // Telecom & Deduplication options
  const [autoCleanPhones, setAutoCleanPhones] = useState(true);
  const [autoDeduplicate, setAutoDeduplicate] = useState(true);
  const [defaultCountryCode, setDefaultCountryCode] = useState('243');

  // Mapping state: which CSV/Excel column maps to which Lead field
  const [mapping, setMapping] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    company: string;
    jobTitle: string;
    phone: string;
    linkedin: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    linkedin: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setError(null);
    setSuccess(null);
    setPreviewData([]);
    setHeaders([]);

    const ext = selected.name.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      Papa.parse(selected, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.data && results.data.length > 0) {
            setHeaders(Object.keys(results.data[0] as any));
            setPreviewData(results.data.slice(0, 3));
          } else {
            setError('Le fichier CSV est vide ou mal formaté.');
          }
        },
        error: (err: any) => {
          setError(`Erreur CSV: ${err.message}`);
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
          
          if (data.length > 1) {
            const h = data[0] as string[];
            setHeaders(h);
            
            const formattedPreview = data.slice(1, 4).map((row: any) => {
              let obj: any = {};
              h.forEach((header, index) => {
                obj[header] = row[index];
              });
              return obj;
            });
            
            setPreviewData(formattedPreview);
          } else {
            setError('Le fichier Excel est vide ou ne contient pas de données valides.');
          }
        } catch (e) {
          setError('Erreur de lecture du fichier Excel.');
        }
      };
      reader.readAsBinaryString(selected);
    } else {
      setError('Format non supporté. Veuillez importer un fichier .csv ou .xlsx');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    if (!mapping.email && !mapping.phone) {
      setError('Vous devez mapper au moins le champ Email ou le champ Téléphone.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    let allData: any[] = [];

    try {
      if (ext === 'csv') {
        const text = await file.text();
        const results = Papa.parse(text, { header: true, skipEmptyLines: true });
        allData = results.data;
      } else if (ext === 'xlsx' || ext === 'xls') {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        allData = XLSX.utils.sheet_to_json(ws);
      }

      const rawLeads: Partial<Lead>[] = [];
      
      for (const row of allData) {
        const email = mapping.email ? String(row[mapping.email] || '').trim() : '';
        const phone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';
        const firstName = mapping.firstName ? String(row[mapping.firstName] || '').trim() : '';
        const lastName = mapping.lastName ? String(row[mapping.lastName] || '').trim() : '';

        // Ignorer les lignes totalement vides
        if (!email && !phone && !firstName && !lastName) continue;

        rawLeads.push({
          firstName: firstName || 'Contact',
          lastName: lastName || '',
          email: email || '',
          company: mapping.company ? String(row[mapping.company] || '').trim() : 'Non renseigné',
          jobTitle: mapping.jobTitle ? String(row[mapping.jobTitle] || '').trim() : 'Décideur',
          phone: phone || '',
          linkedinUrl: mapping.linkedin ? String(row[mapping.linkedin] || '').trim() : '',
          status: 'new',
          tags: ['Import'],
          score: 75,
          emailVerified: false
        });
      }

      // 🛡️ Déduplication & Nettoyage E.164
      const report = deduplicateAndCleanLeads(rawLeads, leads, {
        checkPhone: autoDeduplicate,
        checkEmail: autoDeduplicate,
        normalizePhones: autoCleanPhones,
        defaultCountryCode
      });

      for (const lead of report.uniqueLeads) {
        addLead(lead as any);
      }

      const dupesCount = report.duplicatesRemoved.length;
      let msg = `✅ ${report.uniqueCount} contact(s) importé(s) !`;
      if (dupesCount > 0) {
        msg += ` 🛡️ ${dupesCount} doublon(s) éliminé(s) (${report.estimatedSmsCreditsSaved} crédit(s) SMS économisé(s)).`;
      }
      if (report.cleanedPhonesCount > 0) {
        msg += ` 📱 ${report.cleanedPhonesCount} numéro(s) converti(s) en +${defaultCountryCode}.`;
      }

      setSuccess(msg);
      setTimeout(() => {
        onClose();
      }, 2500);

    } catch (err: any) {
      setError(`Erreur lors de l'importation: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={20} />
            Importer des Contacts (Excel/CSV)
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '4px', color: '#f87171', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '4px', color: '#34d399', fontSize: '0.8rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            {success}
          </div>
        )}

        {!file && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              border: '2px dashed var(--border-strong)', 
              borderRadius: '8px', 
              padding: '40px', 
              textAlign: 'center', 
              cursor: 'pointer',
              background: 'rgba(255,255,255,0.02)',
              transition: 'all 0.2s'
            }}
          >
            <UploadCloud size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>
              Glissez-déposez ou cliquez pour sélectionner
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
              Formats supportés: .csv, .xlsx, .xls
            </p>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".csv, .xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
              style={{ display: 'none' }} 
            />
          </div>
        )}

        {file && headers.length > 0 && !success && (
          <div>
            <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.85rem' }}>
              <strong>Fichier :</strong> {file.name}
              <button 
                onClick={() => { setFile(null); setHeaders([]); setPreviewData([]); }}
                style={{ marginLeft: '12px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Changer de fichier
              </button>
            </div>

            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px' }}>Mappage des colonnes</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {Object.entries({
                email: 'Email',
                phone: 'Téléphone (SMS / RCS)',
                firstName: 'Prénom',
                lastName: 'Nom',
                company: 'Entreprise',
                jobTitle: 'Poste',
                linkedin: 'URL LinkedIn'
              }).map(([key, label]) => (
                <div key={key}>
                  <label className="label" style={{ fontSize: '0.75rem' }}>{label}</label>
                  <select 
                    className="select" 
                    value={(mapping as any)[key]} 
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                  >
                    <option value="">-- Ignorer --</option>
                    {headers.map(h => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            {/* Télécom & Deduplication Inspector Box */}
            <div style={{
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              fontSize: '0.78rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={15} color="#34d399" />
                  Nettoyage Télécom & Anti-Doublons SMS
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>ÉCONOMIE CRÉDITS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={autoCleanPhones} 
                    onChange={e => setAutoCleanPhones(e.target.checked)} 
                  />
                  <span>
                    Formater automatiquement les numéros en international (ex: <strong style={{ color: '#ffffff' }}>081...</strong> $\rightarrow$ <strong style={{ color: '#34d399' }}>+{defaultCountryCode}81...</strong>)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={autoDeduplicate} 
                    onChange={e => setAutoDeduplicate(e.target.checked)} 
                  />
                  <span>
                    Éliminer les doublons de numéros et d'emails (évite de facturer deux fois le même prospect)
                  </span>
                </label>
              </div>
            </div>

            {previewData.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>Aperçu (3 premières lignes)</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                        {headers.map(h => <th key={h} style={{ padding: '6px' }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          {headers.map(h => <td key={h} style={{ padding: '6px' }}>{row[h]}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Annuler
              </button>
              <button 
                type="button" 
                onClick={handleImport} 
                disabled={isProcessing || (!mapping.email && !mapping.phone)}
                className="btn btn-primary"
              >
                {isProcessing ? 'Traitement & Déduplication...' : 'Lancer l\'import'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
