import { NextResponse } from 'next/server';

const CPANEL_AUTH_URL = process.env.CPANEL_AUTH_URL || 'https://rayons.net/api/crm-auth.php';
const CPANEL_API_KEY = process.env.CPANEL_API_KEY || 'rayons_crm_secret_master_key_2026';

// Super Admin master credentials (emergency override to prevent lockouts)
const SUPER_ADMIN_CREDENTIALS = {
  email: 'danielkiboko218@gmail.com',
  altEmail: 'crm@rayons.net',
  altEmail2: 'daniel.kiboko@rayons.net',
  passwords: ['RayonsAdmin2026!', 'KibokoAdmin2026!']
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    // 1. TENTATIVE D'AUTHENTIFICATION VIA LE CPANEL RAYONS.NET
    let cpanelVerified = false;
    let cpanelUser = null;
    let cpanelError = null;

    try {
      const response = await fetch(CPANEL_AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': CPANEL_API_KEY
        },
        body: JSON.stringify({ action: 'login', email, password }),
        signal: AbortSignal.timeout(4000)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          cpanelVerified = true;
          cpanelUser = data.user;
        } else {
          cpanelError = data.error;
        }
      }
    } catch (err) {
      // Le serveur cPanel est en cours d'installation ou injoignable temporairement
      cpanelVerified = false;
    }

    // Si le cPanel a répondu positivement
    if (cpanelVerified && cpanelUser) {
      return NextResponse.json({
        success: true,
        source: 'cpanel_rayons_net',
        user: cpanelUser
      });
    }

    // Si le cPanel a explicitement refusé (ex: mot de passe faux ou compte suspendu)
    if (cpanelError) {
      return NextResponse.json(
        { success: false, error: cpanelError },
        { status: 401 }
      );
    }

    // 2. VÉRIFICATION DU COMPTE SUPER ADMIN DE SECOURS (DANIEL KIBOKO)
    // Permet de se connecter même si la BDD cPanel n'a pas encore été importée
    const isSuperAdminEmail = 
      email === SUPER_ADMIN_CREDENTIALS.email || 
      email === SUPER_ADMIN_CREDENTIALS.altEmail || 
      email === SUPER_ADMIN_CREDENTIALS.altEmail2 ||
      email === 'daniel@rayons.net';

    if (isSuperAdminEmail) {
      const isMasterPass = 
        SUPER_ADMIN_CREDENTIALS.passwords.includes(password) || 
        password === 'RayonsAdmin2026!';

      if (isMasterPass) {
        return NextResponse.json({
          success: true,
          source: 'master_superadmin',
          user: {
            id: 'super-admin-daniel',
            name: 'Daniel Kiboko',
            email: 'danielkiboko218@gmail.com',
            role: 'superadmin',
            companyName: 'Rayons.net SaaS',
            status: 'active',
            createdAt: '2026-01-01T00:00:00Z'
          }
        });
      } else {
        return NextResponse.json(
          { success: false, error: 'Mot de passe incorrect pour le compte administrateur.' },
          { status: 401 }
        );
      }
    }

    // Si ce n'est pas le super admin et que le cPanel n'a pas validé : ACCÈS REFUSÉ
    return NextResponse.json(
      { 
        success: false, 
        error: 'Accès non autorisé. Votre compte n\'est pas enregistré sur la passerelle centrale rayons.net.' 
      },
      { status: 403 }
    );

  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur interne d\'authentification.' },
      { status: 500 }
    );
  }
}
