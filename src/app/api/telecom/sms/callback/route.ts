import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      from, 
      to, 
      text, 
      messageId, 
      status, // 'DELIVERED', 'FAILED', 'SENT'
      deliveryTime 
    } = body;

    console.log(`[Telecom SMS Webhook] Inbound event:`, { from, to, text, messageId, status });

    return NextResponse.json({
      received: true,
      processedAt: new Date().toISOString(),
      action: text ? 'inbound_message_logged_to_unibox' : 'delivery_receipt_acknowledged'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur traitement webhook télécom' },
      { status: 500 }
    );
  }
}
