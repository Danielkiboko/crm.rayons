import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      smtpConfig, 
      fromName, 
      fromEmail, 
      toEmail, 
      toName,
      subject, 
      htmlBody, 
      textBody,
      leadVariables 
    } = body;

    if (!toEmail) {
      return NextResponse.json(
        { success: false, error: 'Adresse du destinataire manquante' },
        { status: 400 }
      );
    }

    // Dynamic variable interpolation
    const replaceVariables = (template: string) => {
      if (!template) return '';
      let result = template;
      const vars: Record<string, string> = {
        firstName: leadVariables?.firstName || toName || 'Bonjour',
        lastName: leadVariables?.lastName || '',
        company: leadVariables?.company || 'votre entreprise',
        jobTitle: leadVariables?.jobTitle || 'Décideur',
        email: toEmail,
        ...(leadVariables?.customVariables || {})
      };

      Object.entries(vars).forEach(([key, val]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        result = result.replace(regex, val || '');
      });

      return result;
    };

    const finalSubject = replaceVariables(subject || 'Opportunité de collaboration');
    const finalHtml = replaceVariables(htmlBody || textBody || '');
    const finalText = replaceVariables(textBody || '');

    // If SMTP credentials are provided, send via real SMTP
    if (smtpConfig && smtpConfig.smtpHost && smtpConfig.smtpUser && smtpConfig.smtpPass) {
      const portNumber = Number(smtpConfig.smtpPort) || (smtpConfig.smtpSecure ? 465 : 587);

      const transporter = nodemailer.createTransport({
        host: smtpConfig.smtpHost.trim(),
        port: portNumber,
        secure: smtpConfig.smtpSecure !== undefined ? smtpConfig.smtpSecure : portNumber === 465,
        auth: {
          user: smtpConfig.smtpUser.trim(),
          pass: smtpConfig.smtpPass
        }
      });

      const senderAddress = `"${fromName || 'Rayons CRM'}" <${fromEmail || smtpConfig.smtpUser}>`;

      const info = await transporter.sendMail({
        from: senderAddress,
        to: `"${toName || ''}" <${toEmail}>`,
        subject: finalSubject,
        text: finalText,
        html: finalHtml.includes('<') ? finalHtml : `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #222;">${finalHtml.replace(/\n/g, '<br/>')}</div>`,
        headers: {
          'X-Mailer': 'Rayons-Outreach-Engine',
          'X-Entity-Ref-ID': `camp-${Date.now()}`
        }
      });

      return NextResponse.json({
        success: true,
        mode: 'live_smtp',
        messageId: info.messageId,
        recipient: toEmail,
        sentAt: new Date().toISOString()
      });
    } else {
      // Demo / simulation mode if no SMTP account is configured yet
      return NextResponse.json({
        success: true,
        mode: 'simulated',
        recipient: toEmail,
        subject: finalSubject,
        notice: 'Compte SMTP non renseigné. Email simulé et tracé avec succès dans le CRM.',
        sentAt: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('Email send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur lors de l\'envoi de l\'email'
      },
      { status: 500 }
    );
  }
}
