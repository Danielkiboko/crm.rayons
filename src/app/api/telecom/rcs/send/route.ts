import { NextRequest, NextResponse } from 'next/server';
import { cleanPhoneNumber } from '@/lib/phoneUtils';
import { cleanSmsText } from '@/lib/smsUtils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      to, 
      botId = process.env.GOOGLE_RBM_BOT_ID || process.env.RCS_BOT_ID || 'rayons-bot@rbm.goog',
      title, 
      description, 
      mediaUrl, 
      suggestions = [],
      operatorUrl = process.env.GOOGLE_RBM_ENDPOINT || process.env.RCS_GATEWAY_URL,
      authToken = process.env.GOOGLE_RBM_API_KEY || process.env.RCS_AUTH_TOKEN,
      fallbackToSms = true
    } = body;

    if (!to || (!description && !title)) {
      return NextResponse.json(
        { success: false, error: 'Numéro de téléphone et contenu RCS requis.' },
        { status: 400 }
      );
    }

    // Nettoyage et formatage international du numéro
    const phoneRes = cleanPhoneNumber(to);
    const cleanTo = phoneRes.isValid ? phoneRes.cleaned : to;

    const messageId = `rcs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Construction de l'URL Google RBM ou passerelle partenaire
    let targetUrl = operatorUrl;
    if (targetUrl && targetUrl.includes('rcsbusinessmessaging.googleapis.com')) {
      if (!targetUrl.includes('/agentMessages')) {
        targetUrl = `${targetUrl.replace(/\/+$/, '')}/${encodeURIComponent(cleanTo)}/agentMessages`;
      }
    }

    let rbmResponse: any = null;
    let fallbackTriggered = false;

    if (targetUrl) {
      try {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

        const resp = await fetch(targetUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
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

        // Si l'utilisateur n'est pas compatible RCS (ex: code 404 de Google RBM), déclencher le SMS Fallback
        if (!resp.ok && fallbackToSms) {
          fallbackTriggered = true;
          console.warn(`[RCS Gateway] Échec RBM HTTP ${resp.status}. Bascule automatique vers le Fallback SMS pour ${cleanTo}`);
        }
      } catch (err: any) {
        console.warn('RCS Direct Gateway warning:', err.message);
        if (fallbackToSms) fallbackTriggered = true;
      }
    }

    return NextResponse.json({
      success: true,
      mode: targetUrl ? 'live_rbm_direct' : 'rbm_direct_simulated',
      messageId,
      botId,
      recipient: cleanTo,
      card: {
        title,
        description,
        mediaUrl,
        suggestionsCount: suggestions.length
      },
      fallbackConfigured: fallbackToSms,
      fallbackTriggered,
      fallbackSmsText: fallbackTriggered ? cleanSmsText(`${title ? title + ': ' : ''}${description || ''}`) : undefined,
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
