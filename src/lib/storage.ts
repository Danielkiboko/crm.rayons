import { Campaign, Lead, UniboxMessage, Deal, WarmupConfig, ImageTemplate, EmailAccount } from '@/types';

export const INITIAL_IMAGE_TEMPLATES: ImageTemplate[] = [
  {
    id: 'coffee-mug',
    title: 'Tasse à café matinale personnalisée',
    category: 'coffee',
    thumbnailUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80',
    defaultText: 'Un café pour {{firstName}} ? ☕',
    textPosition: { x: 380, y: 320, fontSize: 32, color: '#2d1506', rotation: -5, maxWidth: 350 },
    showCompanyLogo: true,
    logoPosition: { x: 420, y: 220, width: 80, height: 80 }
  },
  {
    id: 'office-whiteboard',
    title: 'Tableau blanc réunion d\'équipe',
    category: 'whiteboard',
    thumbnailUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80',
    defaultText: 'Objectif Q3 pour {{company}} :\n+250% de croissance avec {{firstName}} ! 🚀',
    textPosition: { x: 350, y: 240, fontSize: 26, color: '#0f172a', rotation: 0, maxWidth: 450 },
    showCompanyLogo: true,
    logoPosition: { x: 520, y: 130, width: 90, height: 90 }
  },
  {
    id: 'tech-laptop',
    title: 'Écran MacBook avec interface dédiée',
    category: 'laptop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&auto=format&fit=crop&q=80',
    defaultText: 'Audit exclusif préparé pour {{company}}\nDirectement pour {{firstName}}',
    textPosition: { x: 440, y: 280, fontSize: 24, color: '#38bdf8', rotation: 0, maxWidth: 380 },
    showCompanyLogo: false
  },
  {
    id: 'billboard',
    title: 'Panneau géant Times Square',
    category: 'billboard',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=600&auto=format&fit=crop&q=80',
    backgroundUrl: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=1200&auto=format&fit=crop&q=80',
    defaultText: 'BIENVENUE {{firstName | uppercase}}\nCHEZ LES LEADERS !',
    textPosition: { x: 420, y: 200, fontSize: 34, color: '#facc15', rotation: 2, maxWidth: 500 },
    showCompanyLogo: true,
    logoPosition: { x: 480, y: 100, width: 110, height: 110 }
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    firstName: 'Thomas',
    lastName: 'Moreau',
    email: 'thomas.moreau@doctolib.fr',
    company: 'Doctolib',
    jobTitle: 'VP Growth & Acquisition',
    linkedinUrl: 'https://linkedin.com/in/thomas-moreau-growth',
    phone: '+33 6 12 34 56 78',
    status: 'replied',
    sentiment: 'meeting_booked',
    tags: ['SaaS', 'Licorne', 'C-Level'],
    createdAt: '2026-09-01T10:00:00Z',
    lastActivity: '2026-09-12T14:22:00Z',
    emailVerified: true,
    score: 94,
    campaignId: 'camp-1',
    currentStepIndex: 3
  },
  {
    id: 'lead-2',
    firstName: 'Sophie',
    lastName: 'Dubois',
    email: 'sophie.dubois@alan.com',
    company: 'Alan',
    jobTitle: 'Head of Outbound Sales',
    linkedinUrl: 'https://linkedin.com/in/sophie-dubois-alan',
    phone: '+33 6 98 76 54 32',
    status: 'replied',
    sentiment: 'interested',
    tags: ['Assurtech', 'Scalable', 'Inbound/Outbound'],
    createdAt: '2026-09-02T11:15:00Z',
    lastActivity: '2026-09-13T08:10:00Z',
    emailVerified: true,
    score: 88,
    campaignId: 'camp-1',
    currentStepIndex: 2
  },
  {
    id: 'lead-3',
    firstName: 'Alexandre',
    lastName: 'Mercier',
    email: 'alexandre@swile.co',
    company: 'Swile',
    jobTitle: 'Chief Revenue Officer (CRO)',
    linkedinUrl: 'https://linkedin.com/in/alex-mercier-cro',
    status: 'in_progress',
    tags: ['RH Tech', 'Licorne'],
    createdAt: '2026-09-04T09:30:00Z',
    lastActivity: '2026-09-11T16:45:00Z',
    emailVerified: true,
    score: 76,
    campaignId: 'camp-1',
    currentStepIndex: 1
  },
  {
    id: 'lead-4',
    firstName: 'Camille',
    lastName: 'Laurent',
    email: 'camille.l@payfit.com',
    company: 'PayFit',
    jobTitle: 'Head of Marketing',
    linkedinUrl: 'https://linkedin.com/in/camille-laurent-payfit',
    status: 'replied',
    sentiment: 'interested',
    tags: ['B2B', 'Fintech'],
    createdAt: '2026-09-05T14:20:00Z',
    lastActivity: '2026-09-12T19:05:00Z',
    emailVerified: true,
    score: 82,
    campaignId: 'camp-1',
    currentStepIndex: 2
  },
  {
    id: 'lead-5',
    firstName: 'Marc',
    lastName: 'Vidal',
    email: 'marc.vidal@qonto.com',
    company: 'Qonto',
    jobTitle: 'Sales Operations Manager',
    linkedinUrl: 'https://linkedin.com/in/marc-vidal-qonto',
    status: 'in_progress',
    tags: ['Fintech', 'Scaleup'],
    createdAt: '2026-09-06T08:45:00Z',
    lastActivity: '2026-09-10T11:00:00Z',
    emailVerified: true,
    score: 70,
    campaignId: 'camp-1',
    currentStepIndex: 1
  },
  {
    id: 'lead-6',
    firstName: 'Élodie',
    lastName: 'Bertrand',
    email: 'elodie@spendesk.com',
    company: 'Spendesk',
    jobTitle: 'VP International Expansion',
    linkedinUrl: 'https://linkedin.com/in/elodie-bertrand',
    status: 'converted',
    sentiment: 'meeting_booked',
    tags: ['Fintech', 'Enterprise'],
    createdAt: '2026-09-03T16:00:00Z',
    lastActivity: '2026-09-12T11:30:00Z',
    emailVerified: true,
    score: 98,
    campaignId: 'camp-1',
    currentStepIndex: 4
  },
  {
    id: 'lead-7',
    firstName: 'Julien',
    lastName: 'Rousseau',
    email: 'j.rousseau@algolia.com',
    company: 'Algolia',
    jobTitle: 'Global Demand Gen Director',
    linkedinUrl: 'https://linkedin.com/in/julien-rousseau',
    status: 'replied',
    sentiment: 'out_of_office',
    tags: ['Tech', 'Search'],
    createdAt: '2026-09-07T12:00:00Z',
    lastActivity: '2026-09-11T09:12:00Z',
    emailVerified: true,
    score: 65,
    campaignId: 'camp-2',
    currentStepIndex: 1
  },
  {
    id: 'lead-8',
    firstName: 'Nicolas',
    lastName: 'Garnier',
    email: 'ngarnier@mirakl.com',
    company: 'Mirakl',
    jobTitle: 'Chief Commercial Officer',
    linkedinUrl: 'https://linkedin.com/in/nicolas-garnier-mirakl',
    status: 'new',
    tags: ['Marketplace', 'Enterprise'],
    createdAt: '2026-09-10T10:00:00Z',
    emailVerified: true,
    score: 60,
    campaignId: 'camp-1',
    currentStepIndex: 0
  }
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'SaaS Outbound Multicanal - Dirigeants & CRO',
    status: 'active',
    createdAt: '2026-09-01T09:00:00Z',
    leadsCount: 142,
    sentCount: 138,
    openedCount: 98,
    clickedCount: 54,
    repliedCount: 32,
    interestedCount: 18,
    bounceCount: 4,
    senderAccounts: ['danielkiboko218@gmail.com'],
    dailyLimit: 60,
    timezone: 'Europe/Paris',
    scheduleDays: [1, 2, 3, 4, 5],
    scheduleStartTime: '08:30',
    scheduleEndTime: '18:30',
    steps: [
      {
        id: 'step-1',
        order: 1,
        type: 'linkedin_visit',
        channel: 'linkedin',
        title: 'Étape 1 : Visite automatique du profil LinkedIn',
        delayDays: 0,
        delayHours: 0
      },
      {
        id: 'step-2',
        order: 2,
        type: 'email_send',
        channel: 'email',
        title: 'Étape 2 : Premier Email avec Photo Café Personnalisée',
        delayDays: 1,
        delayHours: 2,
        subject: 'Café matinal pour {{firstName}} & {{company}} ? ☕',
        body: 'Bonjour {{firstName}},\n\nJ\'ai vu votre récente prise de parole concernant les défis de croissance chez {{company}}.\n\nJe me suis permis de vous préparer une petite attention :\n\n{{personalizedImage}}\n\nSeriez-vous ouvert à échanger 10 minutes ce jeudi ?\n\nBien à vous,\nAlexandre',
        personalizedImageUrl: 'coffee-mug',
        enableABTesting: true,
        subjectB: 'Question rapide concernant le pipeline de {{company}}',
        bodyB: 'Bonjour {{firstName}},\n\nJ\'ai analysé les initiatives récentes de {{company}} et pensé à vous pour notre nouvelle solution d\'accélération commerciale.\n\nDiscutons-en 5 minutes ?\n\nAlexandre'
      },
      {
        id: 'step-3',
        order: 3,
        type: 'linkedin_connect',
        channel: 'linkedin',
        title: 'Étape 3 : Demande de connexion LinkedIn sur-mesure',
        delayDays: 2,
        delayHours: 0,
        linkedInNote: 'Bonjour {{firstName}}, je fais suite à mon email. Ravi de connecter avec l\'équipe dirigeante de {{company}} !'
      },
      {
        id: 'step-4',
        order: 4,
        type: 'email_send',
        channel: 'email',
        title: 'Étape 4 : Relance Valeur Ajoutée + Cas d\'usage',
        delayDays: 3,
        delayHours: 4,
        subject: 'Re: Café matinal pour {{firstName}} & {{company}}',
        body: 'Bonjour {{firstName}},\n\nJe sais que votre temps est précieux en tant que {{jobTitle}} chez {{company}}.\n\nNous venons d\'aider une entreprise similaire à générer +35 rendez-vous qualifiés en 3 semaines.\n\nVoici le créneau de mon calendrier si cela vous inspire : https://cal.com/alexandre/15min\n\nBelle journée !'
      },
      {
        id: 'step-5',
        order: 5,
        type: 'linkedin_message',
        channel: 'linkedin',
        title: 'Étape 5 : Message Privé LinkedIn avec Note Vocale',
        delayDays: 2,
        delayHours: 0,
        body: 'Hello {{firstName}} ! Petite question rapide pour savoir si vous aviez pu jeter un œil à mon retour par email ? Passez une excellente fin de semaine !'
      }
    ]
  },
  {
    id: 'camp-2',
    name: 'Partenariats Stratégiques & Écosystème Tech',
    status: 'active',
    createdAt: '2026-09-05T14:00:00Z',
    leadsCount: 65,
    sentCount: 62,
    openedCount: 48,
    clickedCount: 22,
    repliedCount: 14,
    interestedCount: 9,
    bounceCount: 0,
    senderAccounts: ['alexandre.prospecting@company.io'],
    dailyLimit: 30,
    timezone: 'Europe/Paris',
    scheduleDays: [1, 2, 3, 4],
    scheduleStartTime: '09:00',
    scheduleEndTime: '17:30',
    steps: [
      {
        id: 'step-201',
        order: 1,
        type: 'email_send',
        channel: 'email',
        title: 'Étape 1 : Proposition de synergie partenariale',
        delayDays: 0,
        delayHours: 0,
        subject: 'Synergie entre nos solutions et {{company}}',
        body: 'Bonjour {{firstName}},\n\nJe suis de près les réussites de {{company}} et vois une opportunité évidente de co-marketing et d\'intégration.\n\nQu\'en pensez-vous ?',
        personalizedImageUrl: 'tech-laptop'
      },
      {
        id: 'step-202',
        order: 2,
        type: 'linkedin_connect',
        channel: 'linkedin',
        title: 'Étape 2 : Connexion LinkedIn',
        delayDays: 2,
        delayHours: 0,
        linkedInNote: 'Ravi d\'échanger sur de potentielles synergies avec {{company}} !'
      }
    ]
  }
];

export const INITIAL_WARMUP_CONFIG: WarmupConfig = {
  mailboxEmail: 'danielkiboko218@gmail.com',
  provider: 'google',
  active: true,
  currentScore: 98,
  dailyWarmupSent: 34,
  dailyWarmupTarget: 40,
  rampUpSpeed: 'balanced',
  spfStatus: 'pass',
  dkimStatus: 'pass',
  dmarcStatus: 'pass',
  mxStatus: 'pass',
  inboxPlacementRate: 97.4,
  spamRate: 1.1,
  promoRate: 1.5,
  daysActive: 28
};

export const INITIAL_UNIBOX_MESSAGES: UniboxMessage[] = [
  {
    id: 'msg-1',
    leadId: 'lead-1',
    leadName: 'Thomas Moreau',
    leadEmail: 'thomas.moreau@doctolib.fr',
    leadCompany: 'Doctolib',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    channel: 'email',
    direction: 'inbound',
    subject: 'Re: Café matinal pour Thomas & Doctolib ? ☕',
    snippet: 'Excellente idée la tasse personnalisée ! Je suis dispo mardi à 11h.',
    content: 'Bonjour Alexandre,\n\nExcellente idée la tasse personnalisée Doctolib, ça m\'a bien fait sourire !\n\nNous sommes justement en train de revoir nos processus d\'outreach pour le Q4. Je suis disponible ce mardi à 11h00 pour 20 minutes.\n\nVous pouvez m\'envoyer une invitation Google Meet directement.\n\nBien à vous,\nThomas Moreau',
    timestamp: '2026-09-12T14:22:00Z',
    read: false,
    sentiment: 'meeting_booked',
    campaignId: 'camp-1',
    campaignName: 'SaaS Outbound Multicanal'
  },
  {
    id: 'msg-2',
    leadId: 'lead-2',
    leadName: 'Sophie Dubois',
    leadEmail: 'sophie.dubois@alan.com',
    leadCompany: 'Alan',
    leadAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    channel: 'linkedin',
    direction: 'inbound',
    snippet: 'Hello Alexandre, votre message tombe à pic. Envoyez-moi vos métriques détaillées.',
    content: 'Hello Alexandre, merci pour la connexion !\n\nVotre approche multicanale m\'intéresse. Est-ce que vous avez des études de cas sur des entreprises B2B avec cycle de vente long ? Si oui, envoyez-les moi par ici et je regarde dès demain.',
    timestamp: '2026-09-13T08:10:00Z',
    read: false,
    sentiment: 'interested',
    campaignId: 'camp-1',
    campaignName: 'SaaS Outbound Multicanal'
  },
  {
    id: 'msg-3',
    leadId: 'lead-4',
    leadName: 'Camille Laurent',
    leadEmail: 'camille.l@payfit.com',
    leadCompany: 'PayFit',
    leadAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    channel: 'email',
    direction: 'inbound',
    subject: 'Re: Café matinal pour Camille & PayFit ?',
    snippet: 'Intéressant ! Pouvez-vous m\'envoyer votre deck avant qu\'on se cale un call ?',
    content: 'Bonjour Alexandre,\n\nMerci pour votre message bien ciblé. Nous avons déjà un outil en place mais je suis curieuse de voir vos différenciateurs.\n\nPourriez-vous m\'envoyer une synthèse ou une courte vidéo de démo ?\n\nMerci,\nCamille',
    timestamp: '2026-09-12T19:05:00Z',
    read: true,
    sentiment: 'interested',
    campaignId: 'camp-1',
    campaignName: 'SaaS Outbound Multicanal'
  },
  {
    id: 'msg-4',
    leadId: 'lead-7',
    leadName: 'Julien Rousseau',
    leadEmail: 'j.rousseau@algolia.com',
    leadCompany: 'Algolia',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    channel: 'email',
    direction: 'inbound',
    subject: 'Absence du bureau / Out of Office',
    snippet: 'Je suis actuellement absent jusqu\'au 22 septembre avec accès limité...',
    content: 'Bonjour,\n\nJe suis actuellement en déplacement professionnel jusqu\'au 22 septembre avec un accès limité à mes emails. En cas d\'urgence, contactez mon équipe à growth@algolia.com.\n\nCordialement,\nJulien',
    timestamp: '2026-09-11T09:12:00Z',
    read: true,
    sentiment: 'out_of_office',
    campaignId: 'camp-2',
    campaignName: 'Partenariats Stratégiques'
  }
];

export const INITIAL_DEALS: Deal[] = [
  {
    id: 'deal-1',
    title: 'Déploiement Plateforme Outreach - Doctolib',
    leadId: 'lead-1',
    leadName: 'Thomas Moreau',
    company: 'Doctolib',
    value: 28000,
    stage: 'demo_booked',
    assignedTo: 'Alexandre (Moi)',
    createdAt: '2026-09-12T14:30:00Z',
    expectedCloseDate: '2026-10-15'
  },
  {
    id: 'deal-2',
    title: 'Licences Multicanal & Lemwarm - Alan',
    leadId: 'lead-2',
    leadName: 'Sophie Dubois',
    company: 'Alan',
    value: 19500,
    stage: 'qualified',
    assignedTo: 'Alexandre (Moi)',
    createdAt: '2026-09-13T08:30:00Z',
    expectedCloseDate: '2026-10-30'
  },
  {
    id: 'deal-3',
    title: 'Offre Entreprise Personnalisation - Spendesk',
    leadId: 'lead-6',
    leadName: 'Élodie Bertrand',
    company: 'Spendesk',
    value: 45000,
    stage: 'negotiation',
    assignedTo: 'Sarah L.',
    createdAt: '2026-09-03T17:00:00Z',
    expectedCloseDate: '2026-09-30'
  },
  {
    id: 'deal-4',
    title: 'Package Scaleup - PayFit',
    leadId: 'lead-4',
    leadName: 'Camille Laurent',
    company: 'PayFit',
    value: 12000,
    stage: 'lead',
    assignedTo: 'Alexandre (Moi)',
    createdAt: '2026-09-12T19:30:00Z',
    expectedCloseDate: '2026-11-15'
  }
];

export const INITIAL_EMAIL_ACCOUNTS: EmailAccount[] = [
  {
    id: 'acc-google-daniel',
    name: 'Daniel Kiboko | Lemlist Standard',
    email: 'danielkiboko218@gmail.com',
    provider: 'google',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 465,
    smtpSecure: true,
    smtpUser: 'danielkiboko218@gmail.com',
    smtpPass: '',
    imapHost: 'imap.gmail.com',
    imapPort: 993,
    imapSecure: true,
    imapUser: 'danielkiboko218@gmail.com',
    imapPass: '',
    status: 'connected',
    isDefault: true,
    createdAt: '2026-09-13T09:00:00Z',
    // Lemlist Standard Configuration
    dailyLimit: 50,
    minDelaySeconds: 60,
    maxDelaySeconds: 180,
    customTrackingDomain: 'track.rayons.net',
    plainTextMode: true,
    warmupEnabled: true,
    warmupScore: 99,
    scheduleDays: [1, 2, 3, 4, 5],
    scheduleStartTime: '08:30',
    scheduleEndTime: '18:00',
    dnsStatus: {
      spf: 'pass',
      dkim: 'pass',
      dmarc: 'pass',
      mx: 'pass'
    },
    signature: 'Cordialement,\nDaniel Kiboko\nDirecteur | Rayons\ndanielkiboko218@gmail.com\n\nSi vous ne souhaitez plus recevoir ces messages, répondez simplement "STOP".'
  }
];

// Helper functions for client-side persistence and dynamic updates
const STORAGE_KEYS = {
  CAMPAIGNS: 'lemlist_crm_campaigns',
  LEADS: 'lemlist_crm_leads',
  UNIBOX: 'lemlist_crm_unibox',
  DEALS: 'lemlist_crm_deals',
  WARMUP: 'lemlist_crm_warmup',
  TEMPLATES: 'lemlist_crm_templates',
  EMAIL_ACCOUNTS: 'lemlist_crm_email_accounts'
};

export function getStoredData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item);
  } catch (e) {
    console.error(`Error reading ${key} from storage`, e);
    return fallback;
  }
}

export function setStoredData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to storage`, e);
  }
}
