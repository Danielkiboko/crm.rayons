import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      senderPhoneNumber, 
      text, 
      suggestionResponse, 
      userEvent,
      messageId 
    } = body;

    console.log(`[Telecom RCS Webhook] Inbound interaction:`, { 
      senderPhoneNumber, 
      text: text || suggestionResponse?.text, 
      userEvent 
    });

    return NextResponse.json({
      received: true,
      processedAt: new Date().toISOString(),
      action: 'rcs_interaction_synced_to_unibox'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erreur traitement webhook RCS' },
      { status: 500 }
    );
  }
}
