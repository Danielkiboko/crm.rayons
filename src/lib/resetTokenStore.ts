// Store for pending password reset verification codes
// Stores { email: { code, expiresAt } }

interface ResetEntry {
  code: string;
  expiresAt: number; // timestamp
}

const resetMap = new Map<string, ResetEntry>();

export function storeResetCode(email: string, code: string): void {
  const clean = email.trim().toLowerCase();
  // Valid for 15 minutes
  resetMap.set(clean, {
    code,
    expiresAt: Date.now() + 15 * 60 * 1000
  });
}

export function verifyResetCode(email: string, code: string): { valid: boolean; error?: string } {
  const clean = email.trim().toLowerCase();
  const entry = resetMap.get(clean);

  if (!entry) {
    return { valid: false, error: 'Aucun code de réinitialisation actif pour cette adresse email. Veuillez faire une nouvelle demande.' };
  }

  if (Date.now() > entry.expiresAt) {
    resetMap.delete(clean);
    return { valid: false, error: 'Le code de vérification a expiré (validité 15 min). Veuillez demander un nouveau code.' };
  }

  if (entry.code !== code.trim()) {
    return { valid: false, error: 'Code de vérification incorrect. Veuillez vérifier le code à 6 chiffres reçu.' };
  }

  return { valid: true };
}

export function consumeResetCode(email: string): void {
  resetMap.delete(email.trim().toLowerCase());
}
