import * as XLSX from 'xlsx';
import { Lead } from '@/types';

export interface ParsedLeadResult {
  leads: Partial<Lead>[];
  headers: string[];
  totalRows: number;
  mappedColumns: {
    firstName?: string;
    lastName?: string;
    email?: string;
    company?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    phone?: string;
  };
}

// Normalise a column header for flexible fuzzy matching
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents (prénom -> prenom)
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Smartly identify column mappings from an array of headers
 */
export function detectColumnMapping(headers: string[]) {
  const mapping: ParsedLeadResult['mappedColumns'] = {};

  const patterns = {
    firstName: ['prenom', 'firstname', 'first', 'givenname', 'fname'],
    lastName: ['nom', 'lastname', 'last', 'surname', 'familyname', 'lname', 'nomdefamille'],
    fullName: ['nomcomplet', 'fullname', 'name', 'nomprenom', 'prenomnom', 'contact'],
    email: ['email', 'mail', 'courriel', 'adresseemail', 'workemail', 'proemail', 'emailaddress'],
    company: ['entreprise', 'company', 'societe', 'organisation', 'organization', 'companyname', 'boite'],
    jobTitle: ['poste', 'fonction', 'jobtitle', 'title', 'headline', 'role', 'occupation', 'titre', 'titreduposte'],
    linkedinUrl: ['linkedin', 'linkedinurl', 'profileurl', 'profil', 'url', 'linkedinprofile'],
    phone: ['phone', 'telephone', 'mobile', 'tel', 'cell', 'portable', 'fixe']
  };

  headers.forEach(originalHeader => {
    const norm = normalizeHeader(originalHeader);

    // Email check (highest priority)
    if (!mapping.email && patterns.email.some(p => norm.includes(p))) {
      mapping.email = originalHeader;
      return;
    }

    // First Name check
    if (!mapping.firstName && patterns.firstName.some(p => norm === p || norm.includes(p))) {
      mapping.firstName = originalHeader;
      return;
    }

    // Last Name check
    if (!mapping.lastName && patterns.lastName.some(p => norm === p || norm.includes(p))) {
      mapping.lastName = originalHeader;
      return;
    }

    // Company check
    if (!mapping.company && patterns.company.some(p => norm === p || norm.includes(p))) {
      mapping.company = originalHeader;
      return;
    }

    // Job Title check
    if (!mapping.jobTitle && patterns.jobTitle.some(p => norm === p || norm.includes(p))) {
      mapping.jobTitle = originalHeader;
      return;
    }

    // LinkedIn check
    if (!mapping.linkedinUrl && patterns.linkedinUrl.some(p => norm.includes(p))) {
      mapping.linkedinUrl = originalHeader;
      return;
    }

    // Phone check
    if (!mapping.phone && patterns.phone.some(p => norm.includes(p))) {
      mapping.phone = originalHeader;
      return;
    }
  });

  return mapping;
}

/**
 * Parse an Excel (.xlsx, .xls) or CSV file buffer and return structured leads
 */
export async function parseExcelOrCsvFile(file: File): Promise<ParsedLeadResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          throw new Error('Impossible de lire le fichier');
        }

        // Read workbook using SheetJS
        const workbook = XLSX.read(buffer, {
          type: 'array',
          cellDates: true,
          raw: false
        });

        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new Error('Le classeur Excel est vide');
        }

        const worksheet = workbook.Sheets[sheetName];
        // Convert sheet to JSON array of row objects
        const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          throw new Error('Aucune donnée trouvée dans la feuille Excel');
        }

        const headers = Object.keys(rawJson[0]);
        const mapping = detectColumnMapping(headers);

        const leads: Partial<Lead>[] = [];

        rawJson.forEach((row, index) => {
          let firstName = mapping.firstName ? String(row[mapping.firstName] || '').trim() : '';
          let lastName = mapping.lastName ? String(row[mapping.lastName] || '').trim() : '';
          const email = mapping.email ? String(row[mapping.email] || '').trim() : '';
          const company = mapping.company ? String(row[mapping.company] || '').trim() : 'Entreprise';
          const jobTitle = mapping.jobTitle ? String(row[mapping.jobTitle] || '').trim() : 'Décideur';
          const linkedinUrl = mapping.linkedinUrl ? String(row[mapping.linkedinUrl] || '').trim() : '';
          const phone = mapping.phone ? String(row[mapping.phone] || '').trim() : '';

          // If no separate first/last name, try to split a full name if available
          if (!firstName && !lastName) {
            const nameKey = headers.find(h => normalizeHeader(h).includes('name') || normalizeHeader(h).includes('nom'));
            if (nameKey && row[nameKey]) {
              const full = String(row[nameKey]).trim().split(' ');
              firstName = full[0] || 'Contact';
              lastName = full.slice(1).join(' ') || '';
            }
          }

          // Retain custom variables for unknown columns
          const customVariables: Record<string, string> = {};
          headers.forEach(h => {
            if (
              h !== mapping.firstName &&
              h !== mapping.lastName &&
              h !== mapping.email &&
              h !== mapping.company &&
              h !== mapping.jobTitle &&
              h !== mapping.linkedinUrl &&
              h !== mapping.phone &&
              row[h]
            ) {
              customVariables[h] = String(row[h]);
            }
          });

          // Only keep rows that have at least an email or a name
          if (email || firstName || lastName) {
            leads.push({
              firstName: firstName || 'Contact',
              lastName: lastName || '',
              email: email || '',
              company: company || 'Non renseigné',
              jobTitle: jobTitle || 'Décideur',
              linkedinUrl: linkedinUrl || undefined,
              phone: phone || undefined,
              customVariables: Object.keys(customVariables).length > 0 ? customVariables : undefined,
              tags: ['Import Excel LinkedIn']
            });
          }
        });

        resolve({
          leads,
          headers,
          totalRows: rawJson.length,
          mappedColumns: mapping
        });
      } catch (err: any) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
    reader.readAsArrayBuffer(file);
  });
}
