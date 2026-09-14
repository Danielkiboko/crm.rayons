import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'LemFlow Direct Telecom & RCS Interconnection Gateway',
    version: '2.0.0',
    description: 'Direct operator integration gateway bypassing third-party aggregators.',
    routes: [
      {
        channel: 'SMS',
        type: 'Outbound',
        endpoint: '/api/telecom/sms/send',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          to: '+243xxxxxxxxx / +33xxxxxxxxx',
          message: 'Votre message SMS texte',
          senderId: 'RAYONS',
          operatorUrl: 'https://smsc.operator.com/api/v1/send (optionnel pour dispatch live)',
          authToken: 'Bearer <token> (optionnel)'
        }
      },
      {
        channel: 'SMS',
        type: 'Inbound Webhook / DLR',
        endpoint: '/api/telecom/sms/callback',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        description: 'Webhook à fournir à l\'opérateur télécom pour les accusés de réception (DLR) et réponses (MO SMS).'
      },
      {
        channel: 'RCS',
        type: 'Outbound Rich Card',
        endpoint: '/api/telecom/rcs/send',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          to: '+243xxxxxxxxx / +33xxxxxxxxx',
          botId: 'rayons-bot@rbm.goog',
          title: 'Titre de la carte enrichie',
          description: 'Description interactive',
          mediaUrl: 'https://...',
          suggestions: [
            { type: 'reply', text: 'Prendre rendez-vous' },
            { type: 'url', text: 'Visiter le site', url: 'https://rayons.net' }
          ]
        }
      },
      {
        channel: 'RCS',
        type: 'Inbound Webhook',
        endpoint: '/api/telecom/rcs/callback',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        description: 'Webhook Google RBM / Jibe Cloud pour synchroniser les clics boutons et réponses.'
      }
    ]
  });
}
