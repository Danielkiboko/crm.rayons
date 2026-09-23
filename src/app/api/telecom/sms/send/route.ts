import { NextRequest, NextResponse } from 'next/server';
import { cleanSmsText, analyzeSmsText } from '@/lib/smsUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      to, 
      message, 
      senderId = 'RAYONS', 
      operatorUrl, 
      authToken,
      leadId,
      campaignId,
      autoCleanGsm = true
    } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone destinataire (to) et contenu du SMS (message) requis.' },
        { status: 400 }
      );
    }

    // Traitement des caractères spéciaux :
    // Si autoCleanGsm est actif, on translitère automatiquement (guillemets courbes, accents non GSM, em-dash, etc.)
    // pour garantir une compatibilité 100% avec les passerelles SMPP/SMSC et préserver le quota de 160 car./SMS.
    const effectiveMessage = autoCleanGsm ? cleanSmsText(message) : message;
    const analysis = analyzeSmsText(effectiveMessage);

    // Envoi réel vers la passerelle opérateur si configurée
    let operatorResponse = null;
    if (operatorUrl) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const resp = await fetch(operatorUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            from: senderId,
            to,
            text: effectiveMessage,
            encoding: analysis.encoding,
            parts: analysis.partsCount,
            timestamp: new Date().toISOString()
          })
        });
        operatorResponse = await resp.json().catch(() => ({ status: resp.status }));
      } catch (err: any) {
        console.warn('Telecom operator gateway dispatch warning:', err.message);
      }
    }

    const messageId = `sms-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return NextResponse.json({
      success: true,
      mode: operatorUrl ? 'live_telecom_direct' : 'direct_gateway_simulated',
      messageId,
      senderId,
      recipient: to,
      originalLength: message.length,
      finalLength: effectiveMessage.length,
      finalMessage: effectiveMessage,
      encoding: analysis.encoding,
      isGsm7: analysis.isGsm7,
      partsCount: analysis.partsCount,
      autoCleaned: autoCleanGsm && effectiveMessage !== message,
      operatorResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'envoi du SMS opérateur' },
      { status: 500 }
    );
  }
}
