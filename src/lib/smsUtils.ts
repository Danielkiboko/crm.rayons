/**
 * SMS Encoding & GSM 03.38 Transliteration Utilities
 * CRM Rayons SMPP & Telecom Outreach Engine
 *
 * GSM 03.38 standard defines a 7-bit character set (160 characters/SMS).
 * Characters outside this table force the SMS gateway into UCS-2 (Unicode 16-bit),
 * collapsing the limit from 160 down to 70 characters/SMS (multiplying operator billing costs)
 * and frequently causing corrupted '?' or mojibake on telecom operators.
 */

// Basic GSM 03.38 character set (1 septet = 1 character)
const GSM_BASIC_CHARS = new Set([
  '@', '£', '$', '¥', 'è', 'é', 'ù', 'ì', 'ò', 'Ç', '\n', 'Ø', 'ø', '\r', 'Å', 'å',
  'Δ', '_', 'Φ', 'Γ', 'Λ', 'Ω', 'Π', 'Ψ', 'Σ', 'Θ', 'Ξ', 'Æ', 'æ', 'ß', 'É',
  ' ', '!', '"', '#', '¤', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', ':', ';', '<', '=', '>', '?',
  '¡', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'Ä', 'Ö', 'Ñ', 'Ü', '§',
  '¿', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'ä', 'ö', 'ñ', 'ü', 'à'
]);

// Extended GSM 03.38 characters (Each requires ESC byte 0x1B -> counts as 2 characters)
const GSM_EXTENDED_CHARS = new Set([
  '^', '{', '}', '\\', '[', '~', ']', '|', '€'
]);

/**
 * Table de remplacement pour translitérer tous les caractères Unicode problématiques
 * vers leurs équivalents stricts GSM-7 (évite l'UCS-2 et les '?' opérateurs).
 */
const GSM_TRANSLITERATION_MAP: Record<string, string> = {
  // Guillemets et apostrophes intelligentes (Cause #1 de bascule UCS-2 involontaire sur iOS/Mac)
  '’': '\'',
  '‘': '\'',
  '‚': '\'',
  '‛': '\'',
  '`': '\'',
  '´': '\'',
  '“': '"',
  '”': '"',
  '„': '"',
  '«': '"',
  '»': '"',
  '‟': '"',

  // Tirets et séparateurs
  '—': '-', // em-dash
  '–': '-', // en-dash
  '―': '-',
  '…': '...', // points de suspension
  '•': '-',
  '·': '.',
  '⁃': '-',

  // Espaces non-sécables ou spéciaux
  '\u00A0': ' ', // Non-breaking space
  '\u2000': ' ',
  '\u2001': ' ',
  '\u2002': ' ',
  '\u2003': ' ',
  '\u2004': ' ',
  '\u2005': ' ',
  '\u2006': ' ',
  '\u2007': ' ',
  '\u2008': ' ',
  '\u2009': ' ',
  '\u200A': ' ',
  '\u202F': ' ',
  '\u205F': ' ',
  '\u3000': ' ',
  '\u200B': '', // zero-width space

  // Accents français/européens non pris en charge en GSM-7 de base
  'ê': 'e',
  'ë': 'e',
  'ē': 'e',
  'ė': 'e',
  'ę': 'e',
  'Ê': 'E',
  'Ë': 'E',
  'î': 'i',
  'ï': 'i',
  'í': 'i',
  'ī': 'i',
  'į': 'i',
  'Î': 'I',
  'Ï': 'I',
  'Í': 'I',
  'ô': 'o',
  'ó': 'o',
  'õ': 'o',
  'ō': 'o',
  'œ': 'oe',
  'Ô': 'O',
  'Ó': 'O',
  'Õ': 'O',
  'Œ': 'OE',
  'û': 'u',
  'ú': 'u',
  'ū': 'u',
  'Û': 'U',
  'Ú': 'U',
  'â': 'a',
  'á': 'a',
  'ã': 'a',
  'ā': 'a',
  'Â': 'A',
  'Á': 'A',
  'Ã': 'A',
  'À': 'A',
  'ç': 'c',
  'Ç': 'C',
  'ÿ': 'y',
  'Ÿ': 'Y',

  // Devises et symboles
  '№': 'No',
  '™': '(TM)',
  '©': '(C)',
  '®': '(R)',
  '°': ' deg'
};

/**
 * Translitère intelligemment une chaîne en caractères 100% compatibles GSM-7.
 * Transforme les apostrophes courbes, accents complexes, tirets cadratins et espaces insécables.
 */
export function cleanSmsText(text: string): string {
  if (!text) return '';
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (GSM_TRANSLITERATION_MAP[char] !== undefined) {
      result += GSM_TRANSLITERATION_MAP[char];
    } else if (GSM_BASIC_CHARS.has(char) || GSM_EXTENDED_CHARS.has(char)) {
      result += char;
    } else {
      // Pour les autres caractères inconnus ou émojis non supportés :
      // On normalise Unicode NFD pour séparer lettre et accent si possible
      const normalized = char.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (normalized.length > 0 && (GSM_BASIC_CHARS.has(normalized) || GSM_EXTENDED_CHARS.has(normalized))) {
        result += normalized;
      } else {
        // Remplacement neutre pour éviter les '?' illisibles sur le téléphone du prospect
        result += ' ';
      }
    }
  }
  return result;
}

export interface SmsAnalysis {
  isGsm7: boolean;
  encoding: 'GSM-7' | 'UCS-2';
  totalCharacters: number;
  weightedLength: number; // Compte double pour les caractères étendus GSM (ex: €)
  maxPerPart: number; // 160 (GSM-7) ou 70 (UCS-2)
  maxMultipart: number; // 153 (GSM-7) ou 67 (UCS-2)
  partsCount: number; // Nombre de SMS facturés
  remainingInPart: number; // Caractères restants avant le SMS suivant
  nonGsmCharacters: string[]; // Liste des caractères qui forcent le mode UCS-2
  cleanTextSuggestion: string; // Texte nettoyé optimisé GSM-7
}

/**
 * Analyse en temps réel le texte d'un SMS :
 * - Détecte l'encodage (GSM-7 vs UCS-2)
 * - Calcule les segments d'envoi et les caractères restants
 * - Identifie précisément les caractères spéciaux bloquants
 * - Fournit la suggestion nettoyée
 */
export function analyzeSmsText(text: string): SmsAnalysis {
  if (!text) {
    return {
      isGsm7: true,
      encoding: 'GSM-7',
      totalCharacters: 0,
      weightedLength: 0,
      maxPerPart: 160,
      maxMultipart: 153,
      partsCount: 0,
      remainingInPart: 160,
      nonGsmCharacters: [],
      cleanTextSuggestion: ''
    };
  }

  const nonGsmSet = new Set<string>();
  let isGsm7 = true;
  let weightedLength = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (GSM_BASIC_CHARS.has(char)) {
      weightedLength += 1;
    } else if (GSM_EXTENDED_CHARS.has(char)) {
      weightedLength += 2; // Caractère d'échappement ESC requis
    } else {
      isGsm7 = false;
      nonGsmSet.add(char);
      weightedLength += 1;
    }
  }

  const nonGsmCharacters = Array.from(nonGsmSet);
  const cleanTextSuggestion = cleanSmsText(text);

  if (isGsm7) {
    const singleLimit = 160;
    const multiLimit = 153;
    let partsCount = 1;
    let remainingInPart = singleLimit - weightedLength;

    if (weightedLength > singleLimit) {
      partsCount = Math.ceil(weightedLength / multiLimit);
      remainingInPart = (partsCount * multiLimit) - weightedLength;
    }

    return {
      isGsm7: true,
      encoding: 'GSM-7',
      totalCharacters: text.length,
      weightedLength,
      maxPerPart: singleLimit,
      maxMultipart: multiLimit,
      partsCount,
      remainingInPart: Math.max(0, remainingInPart),
      nonGsmCharacters: [],
      cleanTextSuggestion
    };
  } else {
    // Mode UCS-2 (Unicode forcé)
    const singleLimit = 70;
    const multiLimit = 67;
    const totalChars = Array.from(text).length; // Gestion correcte des paires surrogate
    let partsCount = 1;
    let remainingInPart = singleLimit - totalChars;

    if (totalChars > singleLimit) {
      partsCount = Math.ceil(totalChars / multiLimit);
      remainingInPart = (partsCount * multiLimit) - totalChars;
    }

    return {
      isGsm7: false,
      encoding: 'UCS-2',
      totalCharacters: totalChars,
      weightedLength: totalChars,
      maxPerPart: singleLimit,
      maxMultipart: multiLimit,
      partsCount,
      remainingInPart: Math.max(0, remainingInPart),
      nonGsmCharacters,
      cleanTextSuggestion
    };
  }
}
