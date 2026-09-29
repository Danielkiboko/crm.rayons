import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, company, plan, loginUrl } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Adresse e-mail requise.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const recipientName = name?.trim() || cleanEmail.split('@')[0];
    const companyName = company?.trim() || 'Votre Entreprise';
    const destinationUrl = loginUrl || 'https://crm.rayons.net/login';
    const isPro = plan === 'pro_monthly';

    // Beautiful Responsive HTML Email Template
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenue sur CRM Rayons</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f4f4f5;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #09090b; padding: 40px 16px;">
          <tr>
            <td align="center">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
                
                <!-- Header -->
                <tr>
                  <td style="padding: 32px 32px 24px; border-bottom: 1px solid #27272a; text-align: left;">
                    <div style="display: inline-block; padding: 8px 12px; background: #ffffff; color: #000000; font-weight: 900; font-size: 13px; letter-spacing: 0.1em; border-radius: 4px; margin-bottom: 12px;">
                      CRM RAYONS
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.02em;">
                      Bienvenue sur votre espace CRM
                    </h1>
                  </td>
                </tr>

                <!-- Content Body -->
                <tr>
                  <td style="padding: 32px; font-size: 15px; line-height: 1.6; color: #a1a1aa;">
                    <p style="margin: 0 0 16px; color: #ffffff; font-size: 16px; font-weight: 600;">
                      Bonjour ${recipientName},
                    </p>
                    <p style="margin: 0 0 24px;">
                      Votre compte client pour <strong>${companyName}</strong> a été créé avec succès sur la plateforme <strong>CRM Rayons</strong>.
                    </p>

                    <!-- Credentials Box -->
                    <div style="background-color: #18181b; border: 1px solid #3f3f46; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                      <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #71717a; margin-bottom: 12px; font-weight: 700;">
                        Vos Identifiants de Connexion
                      </div>
                      <table width="100%" border="0" cellspacing="0" cellpadding="6">
                        <tr>
                          <td width="35%" style="color: #71717a; font-size: 14px;">Adresse e-mail :</td>
                          <td style="color: #ffffff; font-weight: 600; font-size: 14px;">${cleanEmail}</td>
                        </tr>
                        ${password ? `
                        <tr>
                          <td style="color: #71717a; font-size: 14px;">Mot de passe initial :</td>
                          <td style="color: #38bdf8; font-weight: 700; font-family: monospace; font-size: 15px;">${password}</td>
                        </tr>
                        ` : `
                        <tr>
                          <td style="color: #71717a; font-size: 14px;">Mot de passe :</td>
                          <td style="color: #ffffff; font-size: 14px;"><em>Défini lors de votre inscription</em></td>
                        </tr>
                        `}
                        <tr>
                          <td style="color: #71717a; font-size: 14px;">Formule :</td>
                          <td style="color: #34d399; font-weight: 600; font-size: 14px;">
                            ${isPro ? 'Abonnement Pro Mensuel (30 $/mois)' : 'Essai Gratuit 7 Jours'}
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- CTA Button -->
                    <div style="text-align: center; margin-bottom: 30px;">
                      <a href="${destinationUrl}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 6px; text-decoration: none; letter-spacing: -0.01em;">
                        Accéder à mon CRM Rayons →
                      </a>
                    </div>

                    <p style="margin: 0; font-size: 12px; color: #71717a; line-height: 1.5; border-top: 1px solid #27272a; padding-top: 20px;">
                      💡 <strong>Conseil de sécurité :</strong> Nous vous conseillons de changer votre mot de passe temporaire dès votre première session dans l'onglet Profil / Paramètres.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #0c0c0e; padding: 20px 32px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a;">
                    CRM Rayons &bull; Espace Client & Prospection Haute Délivrabilité<br/>
                    Support : <a href="mailto:danielkiboko218@gmail.com" style="color: #71717a; text-decoration: underline;">danielkiboko218@gmail.com</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textContent = `Bonjour ${recipientName},\n\nVotre compte CRM Rayons a été créé avec succès pour ${companyName}.\n\nVos accès :\n- Email : ${cleanEmail}\n${password ? `- Mot de passe initial : ${password}\n` : ''}- Lien de connexion : ${destinationUrl}\n- Plan : ${isPro ? 'Abonnement Pro (30 $/mois)' : 'Essai Gratuit 7 Jours'}\n\nÀ très vite sur votre espace CRM Rayons !`;

    // Send email using SMTP
    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER || 'danielkiboko218@gmail.com';
    const smtpPass = process.env.SMTP_PASS || '';

    let mailSent = false;
    let mailError = null;

    if (smtpPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });

        await transporter.sendMail({
          from: `"CRM Rayons" <${smtpUser}>`,
          to: cleanEmail,
          subject: 'Bienvenue sur CRM Rayons - Vos identifiants de connexion',
          text: textContent,
          html: htmlContent
        });
        mailSent = true;
      } catch (err: any) {
        console.error('SMTP welcome mail send error:', err);
        mailError = err.message;
      }
    } else {
      console.log(`[WELCOME EMAIL DISPATCH SIMULATED - SMTP_PASS not set] To: ${cleanEmail}`);
    }

    return NextResponse.json({
      success: true,
      deliveredViaSmtp: mailSent,
      recipient: cleanEmail,
      warning: !mailSent && !smtpPass ? 'SMTP non configuré dans .env.local, mail prêt à être expédié dès que SMTP_PASS est renseigné.' : undefined,
      error: mailError
    });
  } catch (error: any) {
    console.error('Welcome email API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'envoi de l\'email de bienvenue' },
      { status: 500 }
    );
  }
}
