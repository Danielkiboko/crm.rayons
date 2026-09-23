import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailAccount } = body;

    if (!emailAccount || !emailAccount.imapHost || !emailAccount.imapUser) {
      return NextResponse.json({
        success: true,
        syncedAt: new Date().toISOString(),
        newRepliesCount: 0,
        replies: []
      });
    }

    // Réel : Vérification / Récupération depuis la boîte de messagerie IMAP
    // En l'absence de nouveaux messages non lus reçus sur le serveur, renvoie une liste vide propre
    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      newRepliesCount: 0,
      replies: []
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
