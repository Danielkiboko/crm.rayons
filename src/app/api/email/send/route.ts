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

    // Dynamic variable interpolation with Lemlist standards (e.g. {{firstName | default: 'Bonjour'}})
    const replaceVariables = (template: string) => {
      if (!template) return '';
      let result = template;
      const vars: Record<string, string> = {
        firstName: leadVariables?.firstName || toName || 'Bonjour',
        lastName: leadVariables?.lastName || '',
        company: leadVariables?.company || 'votre entreprise',
        jobTitle: leadVariables?.jobTitle || 'Décideur',
        email: toEmail,
        icebreaker: leadVariables?.customVariables?.icebreaker || leadVariables?.icebreaker || 'J\'ai suivi avec attention vos dernières actualités.',
        unsubscribe: '<a href="#unsubscribe" style="color: #888; font-size: 11px; text-decoration: underline;">Se désinscrire</a>',
        ...(leadVariables?.customVariables || {})
      };

      // Handle simple variables {{key}}
      Object.entries(vars).forEach(([key, val]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
        result = result.replace(regex, val || '');
      });

      // Handle Lemlist fallback syntax: {{variable | default: 'fallback text'}} or {{variable | fallback: 'text'}}
      result = result.replace(/{{\s*([a-zA-Z0-9_]+)\s*\|\s*(?:default|fallback):\s*['"]([^'"]+)['"]\s*}}/gi, (_, varName, fallback) => {
        return vars[varName] && vars[varName].trim() !== '' ? vars[varName] : fallback;
      });

      return result;
    };

    const finalSubject = replaceVariables(subject || 'Opportunité de collaboration');
    let finalHtml = replaceVariables(htmlBody || textBody || '');
    let finalText = replaceVariables(textBody || '');

    // Lemlist unsubscribe footer standard
    const unsubscribeFooterText = '\n\n---\nSi vous préférez ne plus recevoir nos échanges, répondez simplement "STOP".';
    const unsubscribeFooterHtml = '<br/><br/><div style="font-size: 11px; color: #888888; border-top: 1px solid #eeeeee; padding-top: 12px; margin-top: 24px;">Si vous préférez ne plus recevoir nos échanges, répondez simplement <strong>STOP</strong> ou <a href="#unsubscribe" style="color: #666; text-decoration: underline;">cliquez ici pour vous désabonner</a>.</div>';

    if (!finalText.includes('STOP') && !finalText.includes('désinscr')) {
      finalText += unsubscribeFooterText;
    }
    if (!finalHtml.includes('STOP') && !finalHtml.includes('désinscr')) {
      finalHtml += unsubscribeFooterHtml;
    }

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

      const senderAddress = `"${fromName || 'Daniel Kiboko'}" <${fromEmail || smtpConfig.smtpUser}>`;

      const info = await transporter.sendMail({
        from: senderAddress,
        to: `"${toName || ''}" <${toEmail}>`,
        subject: finalSubject,
        text: finalText,
        html: finalHtml.includes('<') ? finalHtml : `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; color: #222;">${finalHtml.replace(/\n/g, '<br/>')}</div>`,
        headers: {
          'X-Mailer': 'LemFlow-Lemlist-Standard-Engine',
          'X-Entity-Ref-ID': `camp-${Date.now()}`,
          'List-Unsubscribe': `<mailto:${fromEmail || smtpConfig.smtpUser}?subject=unsubscribe>`
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
