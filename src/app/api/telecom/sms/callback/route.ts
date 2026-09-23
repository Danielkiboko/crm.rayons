import { NextRequest, NextResponse } from 'next/server';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { UniboxMessage } from '@/types';

/**
 * Webhook SMS entrant — CRM Rayons Telecom
 * Reçoit les événements de livraison et les messages inbound depuis les opérateurs/agrégateurs.
 * Persiste automatiquement dans Firestore (unibox multi-tenant).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { 
      from,       // numéro expéditeur (ex: "+33612345678")
      to,         // numéro destinataire / sender ID
      text,       // corps du message SMS (absent si delivery receipt)
      messageId, 
      status,     // 'DELIVERED', 'FAILED', 'SENT'
      deliveryTime,
      userId      // optionnel : transmis par l'opérateur si configuré
    } = body;

    console.log(`[CRM Rayons — SMS Webhook] Inbound event:`, { from, to, text, messageId, status });

    // 1. Accusé de réception opérateur (DLR / Status Report)
    if (!text && status) {
      const normalizedStatus = String(status).toUpperCase();
      const isDelivered = normalizedStatus === 'DELIVERED' || normalizedStatus === 'SENT';
      const isFailed = normalizedStatus === 'FAILED' || normalizedStatus === 'UNDELIVERED' || normalizedStatus === 'REJECTED';

      if (isFirebaseConfigured && db && (to || from)) {
        try {
          const targetPhone = to || from;
          // Rechercher le lead par numéro de téléphone
          const userPrefix = userId ? `users/${userId}/leads` : 'leads';
          const leadsCol = collection(db, userPrefix);
          const q = query(leadsCol, where('phone', '==', targetPhone));
          const snap = await getDocs(q);

          if (!snap.empty) {
            const leadDoc = snap.docs[0];
            await setDoc(leadDoc.ref, {
              deliveryStatus: isDelivered ? 'delivered' : isFailed ? 'failed' : 'pending',
              deliveryDate: deliveryTime || new Date().toISOString(),
              deliveryError: isFailed ? `Échec opérateur SMSC (${status})` : null,
              lastActivity: new Date().toISOString()
            }, { merge: true });
          }
        } catch (dlrErr: any) {
          console.warn('[CRM Rayons — SMS DLR] Lead status update warning:', dlrErr.message);
        }
      }

      return NextResponse.json({
        received: true,
        processedAt: new Date().toISOString(),
        action: 'delivery_receipt_acknowledged',
        messageId,
        status: normalizedStatus,
        delivered: isDelivered
      });
    }

    // Message SMS entrant : persistance dans Firestore Unibox
    if (isFirebaseConfigured && db && userId) {
      try {
        // Tenter de matcher le numéro `from` avec un lead existant
        const leadsCol = collection(db, 'users', userId, 'leads');
        const q = query(leadsCol, where('phone', '==', from));
        const snap = await getDocs(q);

        const matchedLead = !snap.empty ? snap.docs[0].data() : null;
        const msgId = `sms-inbound-${messageId || Date.now()}`;

        const uniboxMessage: UniboxMessage = {
          id: msgId,
          leadId: matchedLead?.id || `unknown-${from}`,
          leadName: matchedLead ? `${matchedLead.firstName} ${matchedLead.lastName}` : from,
          leadEmail: matchedLead?.email || '',
          leadCompany: matchedLead?.company || 'Inconnu',
          channel: 'sms',
          direction: 'inbound',
          snippet: text.slice(0, 120),
          content: text,
          timestamp: deliveryTime || new Date().toISOString(),
          read: false,
          sentiment: 'neutral',
        };

        const msgRef = doc(db, 'users', userId, 'messages', msgId);
        await setDoc(msgRef, uniboxMessage, { merge: true });

        return NextResponse.json({
          received: true,
          processedAt: new Date().toISOString(),
          action: 'inbound_sms_saved_to_unibox',
          messageId: msgId,
          leadMatched: !!matchedLead
        });
      } catch (dbError: any) {
        console.error('[CRM Rayons — SMS Webhook] Firestore error:', dbError);
        // Ne pas bloquer l'accusé de réception même si la persistance échoue
      }
    }

    return NextResponse.json({
      received: true,
      processedAt: new Date().toISOString(),
      action: 'inbound_message_logged',
      note: userId ? 'Firestore persist attempted' : 'userId manquant — message non persisté'
    });

  } catch (error: any) {
    console.error('[CRM Rayons — SMS Webhook] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur traitement webhook télécom' },
      { status: 500 }
    );
  }
}
