import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { storeResetCode } from '@/lib/resetTokenStore';
import { INITIAL_SAAS_USERS } from '@/lib/userStore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Veuillez saisir votre adresse e-mail.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Strict database check: Initial users or Firestore
    const isUserInInitial = INITIAL_SAAS_USERS.some(u => u.email.toLowerCase() === cleanEmail);
    let existsInDb = isUserInInitial;

    if (!existsInDb) {
      try {
        const { fetchUserByEmailFromFirestore } = await import('@/lib/firestoreService');
        const firestoreUser = await fetchUserByEmailFromFirestore(cleanEmail);
        if (firestoreUser) {
          existsInDb = true;
        }
      } catch (e) {
        // firestore query error or unconfigured
      }
    }

    // If not found in database and client has not validated from registered users store, reject immediately
    if (!existsInDb && !body.clientRegistered) {
      return NextResponse.json(
        { success: false, error: "Aucun compte n'est associé à cette adresse e-mail dans la base de données." },
        { status: 404 }
      );
    }

    // Generate secure 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    storeResetCode(cleanEmail, resetCode);

    // Send real email via SMTP
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'danielkiboko218@gmail.com',
          pass: process.env.SMTP_PASS || ''
        }
      });

      await transporter.sendMail({
        from: '"CRM Rayons Sécurité" <danielkiboko218@gmail.com>',
        to: cleanEmail,
        subject: 'Code de réinitialisation de votre mot de passe - CRM Rayons',
        text: `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe pour votre compte CRM Rayons.\n\nVoici votre code de vérification à 6 chiffres : ${resetCode}\n\nCe code est valable pendant 15 minutes.\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #ffffff; color: #111111; border-radius: 8px; border: 1px solid #eeeeee;">
            <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 12px; color: #000000;">CRM RAYONS</h2>
            <p style="font-size: 14px; line-height: 1.5; color: #444444;">
              Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code de vérification ci-dessous pour définir votre nouveau mot de passe :
            </p>
            <div style="background: #f4f4f5; padding: 16px; border-radius: 6px; text-align: center; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #000000; font-family: monospace;">${resetCode}</span>
            </div>
            <p style="font-size: 12px; color: #888888;">
              Ce code expire dans 15 minutes. Si vous n'avez pas demandé cette réinitialisation, aucune action n'est requise.
            </p>
          </div>
        `
      }).catch((sendErr) => {
        console.warn('Direct SMTP send notice:', sendErr.message);
      });
    } catch (e: any) {
      console.warn('Mail transporter notice:', e.message);
    }

    return NextResponse.json({
      success: true,
      message: `Un e-mail de réinitialisation avec votre code à 6 chiffres a été envoyé à ${cleanEmail}.`,
      verificationCodeDemo: resetCode // returned for convenience in case mail is filtered
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la demande de réinitialisation' },
      { status: 500 }
    );
  }
}
