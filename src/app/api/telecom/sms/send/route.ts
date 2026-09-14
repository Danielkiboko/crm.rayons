import { NextRequest, NextResponse } from 'next/server';

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
      campaignId 
    } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone destinataire (to) et contenu du SMS (message) requis.' },
        { status: 400 }
      );
    }

    // Direct telecom gateway dispatch
    // If an operator URL is provided, forward directly to the telecom HTTP/REST SMSC
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
            text: message,
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
      partsCount: Math.ceil(message.length / 160) || 1,
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
