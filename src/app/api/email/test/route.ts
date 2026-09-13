import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPass } = body;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return NextResponse.json(
        { success: false, error: 'Champs obligatoires manquants : Serveur SMTP, Utilisateur et Mot de passe.' },
        { status: 400 }
      );
    }

    const portNumber = Number(smtpPort) || (smtpSecure ? 465 : 587);

    // Create reusable transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      host: smtpHost.trim(),
      port: portNumber,
      secure: smtpSecure !== undefined ? smtpSecure : portNumber === 465,
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 10000
    });

    // Verify connection configuration
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: `Connexion SMTP réussie avec succès vers ${smtpHost}:${portNumber} ! Votre boîte est prête pour envoyer vos campagnes.`
    });
  } catch (error: any) {
    console.error('SMTP test error:', error);
    let message = error.message || 'Échec de la connexion au serveur SMTP.';
    if (error.code === 'EAUTH') {
      message = 'Identifiant ou mot de passe de messagerie incorrect. Pour Google/Workspace, assurez-vous d\'utiliser un "Mot de passe d\'application".';
    } else if (error.code === 'ESOCKET' || error.code === 'ETIMEDOUT') {
      message = 'Délai d\'attente dépassé ou port bloqué. Vérifiez l\'hôte et le port (465 pour SSL, 587 pour TLS).';
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}
