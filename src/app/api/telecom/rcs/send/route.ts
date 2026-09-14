import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      to, 
      botId = 'rayons-bot@rbm.goog',
      title, 
      description, 
      mediaUrl, 
      suggestions = [],
      operatorUrl,
      authToken,
      fallbackToSms = true
    } = body;

    if (!to || (!description && !title)) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone et contenu RCS requis.' },
        { status: 400 }
      );
    }

    const messageId = `rcs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // If telecom / Google RBM endpoint configured, forward payload
    let rbmResponse = null;
    if (operatorUrl) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const resp = await fetch(operatorUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            msisdn: to,
            botId,
            contentMessage: {
              richCard: {
                standaloneCard: {
                  cardOrientation: 'VERTICAL',
                  cardContent: {
                    title: title || '',
                    description: description || '',
                    media: mediaUrl ? { height: 'MEDIUM', contentInfo: { fileUrl: mediaUrl } } : undefined,
                    suggestions: suggestions.map((s: any) => ({
                      reply: s.type === 'reply' ? { text: s.text, postbackData: s.text } : undefined,
                      action: s.type === 'url' ? { text: s.text, openUrlAction: { url: s.url } } : undefined
                    }))
                  }
                }
              }
            }
          })
        });
        rbmResponse = await resp.json().catch(() => ({ status: resp.status }));
      } catch (err: any) {
        console.warn('RCS Direct Gateway warning:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      mode: operatorUrl ? 'live_rbm_direct' : 'rbm_direct_simulated',
      messageId,
      botId,
      recipient: to,
      card: {
        title,
        description,
        mediaUrl,
        suggestionsCount: suggestions.length
      },
      fallbackConfigured: fallbackToSms,
      rbmResponse,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur envoi RCS opérateur' },
      { status: 500 }
    );
  }
}
