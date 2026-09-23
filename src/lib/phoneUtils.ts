/**
 * Phone Number Cleaning, E.164 Formatting & Lead Deduplication Engine
 * CRM Rayons SMPP & Telecom Outreach Platform
 */

import type { Lead } from '@/types';

export interface CleanPhoneResult {
  raw: string;
  cleaned: string;
  isValid: boolean;
  countryCode: string;
  carrier?: string;
  error?: string;
}

/**
 * Nettoie et formate un numéro de téléphone au standard international E.164.
 * Convertit automatiquement les formats locaux (ex: 0812345678 -> +243812345678).
 * Détecte l'opérateur mobile (Vodacom, Orange, Airtel, Africell).
 */
export function cleanPhoneNumber(
  rawInput: string | number | undefined | null,
  defaultCountryCode = '243'
): CleanPhoneResult {
  if (rawInput === undefined || rawInput === null) {
    return { raw: '', cleaned: '', isValid: false, countryCode: defaultCountryCode, error: 'Numéro vide' };
  }

  const raw = String(rawInput).trim();
  if (!raw) {
    return { raw: '', cleaned: '', isValid: false, countryCode: defaultCountryCode, error: 'Numéro vide' };
  }

  // 1. Supprimer espaces, tirets, points, parenthèses, slashs
  let digits = raw.replace(/[\s\.\-\(\)\/\\]/g, '');

  // 2. Remplacer '00' international initial par '+'
  if (digits.startsWith('00')) {
    digits = '+' + digits.slice(2);
  }

  let finalNumber = '';
  let countryCode = defaultCountryCode;

  // 3. Cas A : Le numéro commence déjà par '+' (numéro international explicite)
  if (digits.startsWith('+')) {
    // Supprimer tous les caractères non numériques sauf le '+' initial
    finalNumber = '+' + digits.slice(1).replace(/\D/g, '');
  } else {
    // Cas B : Numéro sans '+'
    const cleanDigits = digits.replace(/\D/g, '');

    // Si commence par l'indicatif pays sans le plus (ex: 243812345678)
    if (cleanDigits.startsWith(defaultCountryCode) && cleanDigits.length >= 11) {
      finalNumber = '+' + cleanDigits;
    } 
    // Si commence par un zéro national (ex: 0812345678 -> 9 ou 10 chiffres au total)
    else if (cleanDigits.startsWith('0')) {
      finalNumber = '+' + defaultCountryCode + cleanDigits.slice(1);
    } 
    // Si numéro local à 9 chiffres sans le zéro (ex: 812345678)
    else if (cleanDigits.length === 9) {
      finalNumber = '+' + defaultCountryCode + cleanDigits;
    } 
    // Autre format
    else {
      finalNumber = '+' + defaultCountryCode + cleanDigits;
    }
  }

  // 4. Validation E.164 (Longueur entre 10 et 15 chiffres après le '+')
  const numOnly = finalNumber.replace(/\D/g, '');
  const isValid = numOnly.length >= 10 && numOnly.length <= 15;

  // 5. Détection de l'opérateur télécom (RDC / international)
  let carrier: string | undefined = undefined;

  if (finalNumber.startsWith('+243')) {
    countryCode = '243';
    const sub = finalNumber.slice(4); // Chiffres après +243

    if (sub.startsWith('81') || sub.startsWith('82') || sub.startsWith('83')) {
      carrier = 'Vodacom';
    } else if (sub.startsWith('84') || sub.startsWith('85') || sub.startsWith('89') || sub.startsWith('80')) {
      carrier = 'Orange';
    } else if (sub.startsWith('97') || sub.startsWith('98') || sub.startsWith('99')) {
      carrier = 'Airtel';
    } else if (sub.startsWith('90') || sub.startsWith('91')) {
      carrier = 'Africell';
    } else {
      carrier = 'Télécom RDC';
    }
  } else if (finalNumber.startsWith('+33')) {
    countryCode = '33';
    carrier = 'France Mobile';
  } else if (finalNumber.startsWith('+1')) {
    countryCode = '1';
    carrier = 'USA / Canada';
  } else if (finalNumber.startsWith('+32')) {
    countryCode = '32';
    carrier = 'Belgique';
  } else if (finalNumber.startsWith('+242')) {
    countryCode = '242';
    carrier = 'Congo-Brazzaville';
  }

  return {
    raw,
    cleaned: isValid ? finalNumber : raw,
    isValid,
    countryCode,
    carrier,
    error: isValid ? undefined : 'Format de numéro non valide (longueur incorrecte)'
  };
}

export interface DeduplicationOptions {
  checkPhone?: boolean;
  checkEmail?: boolean;
  defaultCountryCode?: string;
  normalizePhones?: boolean;
}

export interface DeduplicationResult<T extends Partial<Lead>> {
  uniqueLeads: T[];
  duplicatesRemoved: {
    lead: T;
    reason: 'phone_duplicate' | 'email_duplicate' | 'both_duplicate';
    matchedWith: string;
  }[];
  totalInputCount: number;
  uniqueCount: number;
  phoneDuplicatesCount: number;
  emailDuplicatesCount: number;
  invalidPhonesCount: number;
  cleanedPhonesCount: number;
  estimatedSmsCreditsSaved: number;
}

/**
 * Détecte et élimine les doublons de numéros et d'emails dans une liste,
 * tout en comparant facultativement avec les leads existants dans le CRM.
 */
export function deduplicateAndCleanLeads<T extends Partial<Lead>>(
  inputLeads: T[],
  existingCrmLeads: Lead[] = [],
  options: DeduplicationOptions = {}
): DeduplicationResult<T> {
  const {
    checkPhone = true,
    checkEmail = true,
    defaultCountryCode = '243',
    normalizePhones = true
  } = options;

  const seenPhones = new Map<string, string>(); // cleanedPhone -> identifier/name
  const seenEmails = new Map<string, string>(); // normalizedEmail -> identifier/name

  // Enregistrer d'abord les contacts déjà existants dans le CRM
  existingCrmLeads.forEach(lead => {
    if (checkEmail && lead.email) {
      seenEmails.set(lead.email.toLowerCase().trim(), `${lead.firstName} ${lead.lastName} (CRM Existant)`);
    }
    if (checkPhone && lead.phone) {
      const clean = cleanPhoneNumber(lead.phone, defaultCountryCode);
      if (clean.isValid) {
        seenPhones.set(clean.cleaned, `${lead.firstName} ${lead.lastName} (CRM Existant)`);
      }
    }
  });

  const uniqueLeads: T[] = [];
  const duplicatesRemoved: DeduplicationResult<T>['duplicatesRemoved'] = [];
  let phoneDuplicatesCount = 0;
  let emailDuplicatesCount = 0;
  let invalidPhonesCount = 0;
  let cleanedPhonesCount = 0;

  inputLeads.forEach((item, index) => {
    const leadCopy = { ...item };
    let isDuplicate = false;
    let duplicateReason: 'phone_duplicate' | 'email_duplicate' | 'both_duplicate' = 'phone_duplicate';
    let matchedWith = '';

    // 1. Nettoyage du téléphone
    let cleanedPhoneStr = '';
    if (leadCopy.phone) {
      const res = cleanPhoneNumber(leadCopy.phone, defaultCountryCode);
      if (res.isValid) {
        if (normalizePhones) {
          if (res.cleaned !== leadCopy.phone) {
            cleanedPhonesCount++;
          }
          leadCopy.phone = res.cleaned;
        }
        cleanedPhoneStr = res.cleaned;
      } else {
        invalidPhonesCount++;
      }
    }

    // 2. Vérification doublon téléphone
    let phoneMatched = false;
    if (checkPhone && cleanedPhoneStr) {
      if (seenPhones.has(cleanedPhoneStr)) {
        phoneMatched = true;
        matchedWith = seenPhones.get(cleanedPhoneStr)!;
      }
    }

    // 3. Vérification doublon email
    let emailMatched = false;
    const normalizedEmail = leadCopy.email ? leadCopy.email.toLowerCase().trim() : '';
    if (checkEmail && normalizedEmail) {
      if (seenEmails.has(normalizedEmail)) {
        emailMatched = true;
        matchedWith = seenEmails.get(normalizedEmail)!;
      }
    }

    if (phoneMatched && emailMatched) {
      isDuplicate = true;
      duplicateReason = 'both_duplicate';
      phoneDuplicatesCount++;
      emailDuplicatesCount++;
    } else if (phoneMatched) {
      isDuplicate = true;
      duplicateReason = 'phone_duplicate';
      phoneDuplicatesCount++;
    } else if (emailMatched) {
      isDuplicate = true;
      duplicateReason = 'email_duplicate';
      emailDuplicatesCount++;
    }

    if (isDuplicate) {
      duplicatesRemoved.push({
        lead: leadCopy,
        reason: duplicateReason,
        matchedWith
      });
    } else {
      // Enregistrer ce lead comme vu pour les lignes suivantes du fichier
      const leadLabel = `${leadCopy.firstName || 'Contact'} ${leadCopy.lastName || ''} (Ligne ${index + 1})`.trim();
      if (cleanedPhoneStr) {
        seenPhones.set(cleanedPhoneStr, leadLabel);
      }
      if (normalizedEmail) {
        seenEmails.set(normalizedEmail, leadLabel);
      }
      uniqueLeads.push(leadCopy);
    }
  });

  return {
    uniqueLeads,
    duplicatesRemoved,
    totalInputCount: inputLeads.length,
    uniqueCount: uniqueLeads.length,
    phoneDuplicatesCount,
    emailDuplicatesCount,
    invalidPhonesCount,
    cleanedPhonesCount,
    estimatedSmsCreditsSaved: phoneDuplicatesCount
  };
}
