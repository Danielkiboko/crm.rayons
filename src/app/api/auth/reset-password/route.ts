import { NextRequest, NextResponse } from 'next/server';
import { verifyResetCode, consumeResetCode } from '@/lib/resetTokenStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Email, code de vérification et nouveau mot de passe requis.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Verify 6-digit code
    const verification = verifyResetCode(cleanEmail, code);
    if (!verification.valid) {
      return NextResponse.json(
        { success: false, error: verification.error || 'Code invalide.' },
        { status: 400 }
      );
    }

    // Code is valid! Consume it
    consumeResetCode(cleanEmail);

    return NextResponse.json({
      success: true,
      email: cleanEmail,
      message: 'Votre mot de passe a été réinitialisé avec succès ! Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour du mot de passe.' },
      { status: 500 }
    );
  }
}
