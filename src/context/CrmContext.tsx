'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Campaign, Lead, UniboxMessage, Deal, WarmupConfig, ImageTemplate, CampaignStep, EmailAccount } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  INITIAL_CAMPAIGNS, 
  INITIAL_LEADS, 
  INITIAL_UNIBOX_MESSAGES, 
  INITIAL_DEALS, 
  INITIAL_WARMUP_CONFIG, 
  INITIAL_IMAGE_TEMPLATES,
  INITIAL_EMAIL_ACCOUNTS,
  getStoredData,
  setStoredData
} from '@/lib/storage';
import { verifyEmailAddress } from '@/lib/emailVerifier';
import { 
  syncLeadsToFirestore, 
  fetchLeadsFromFirestore, 
  syncCampaignsToFirestore, 
  fetchCampaignsFromFirestore 
} from '@/lib/firestoreService';

interface CrmContextType {
  campaigns: Campaign[];
  leads: Lead[];
  messages: UniboxMessage[];
  deals: Deal[];
  warmupConfig: WarmupConfig;
  imageTemplates: ImageTemplate[];
  emailAccounts: EmailAccount[];
  
  // Email Accounts
  addEmailAccount: (account: Omit<EmailAccount, 'id' | 'createdAt'>) => EmailAccount;
  updateEmailAccount: (id: string, updates: Partial<EmailAccount>) => void;
  deleteEmailAccount: (id: string) => void;
  setDefaultEmailAccount: (id: string) => void;
  testEmailAccount: (id: string) => Promise<{ success: boolean; message: string }>;

  // Live Outreach & Sending
  sendCampaignEmailLive: (campaignId: string, leadId: string, customSubject?: string, customBody?: string) => Promise<{ success: boolean; error?: string }>;
  sendBulkCampaignLive: (campaignId: string, onProgress?: (sent: number, total: number) => void) => Promise<{ sent: number; failed: number }>;
  syncInboxReplies: () => Promise<{ success: boolean; newCount: number }>;

  // Campaign actions
  createCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openedCount' | 'clickedCount' | 'repliedCount' | 'interestedCount' | 'bounceCount'>) => Campaign;
  updateCampaign: (id: string, updates: Partial<Campaign>) => void;
  deleteCampaign: (id: string) => void;
  toggleCampaignStatus: (id: string) => void;
  addStepToCampaign: (campaignId: string, step: Omit<CampaignStep, 'id' | 'order'>) => void;
  deleteStepFromCampaign: (campaignId: string, stepId: string) => void;
  reorderCampaignSteps: (campaignId: string, steps: CampaignStep[]) => void;
  simulateCampaignSend: (campaignId: string) => void;

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status' | 'emailVerified' | 'score'>) => Lead;
  importLeads: (newLeads: Partial<Lead>[]) => number;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  verifyLeadEmail: (id: string) => Promise<void>;
  verifyAllLeads: () => Promise<{ verified: number; valid: number; risky: number; invalid: number }>;
  removeInvalidLeads: () => number;

  // Unibox actions
  markMessageRead: (messageId: string) => void;
  sendReply: (messageId: string, replyText: string) => void;
  changeMessageSentiment: (messageId: string, sentiment: UniboxMessage['sentiment']) => void;

  // CRM Deals actions
  createDeal: (deal: Omit<Deal, 'id' | 'createdAt'>) => Deal;
  updateDealStage: (dealId: string, stage: Deal['stage']) => void;
  deleteDeal: (dealId: string) => void;

  // Warmup actions
  updateWarmupConfig: (updates: Partial<WarmupConfig>) => void;
  simulateWarmupRound: () => void;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<UniboxMessage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [warmupConfig, setWarmupConfig] = useState<WarmupConfig>(INITIAL_WARMUP_CONFIG);
  const [imageTemplates] = useState<ImageTemplate[]>(INITIAL_IMAGE_TEMPLATES);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Scoped storage key per user tenant to prevent data collisions & amalgamations
  const getTenantKey = (type: string, userId?: string) => {
    const uid = userId || user?.id || 'guest';
    return `rayons_crm_tenant_${uid}_${type}`;
  };

  // Load tenant-isolated data when user changes
  useEffect(() => {
    if (!user) {
      setCampaigns([]);
      setLeads([]);
      setMessages([]);
      setDeals([]);
      setEmailAccounts([]);
      setIsLoaded(false);
      return;
    }

    const isSuper = user.role === 'superadmin' || user.email === 'danielkiboko218@gmail.com' || user.email === 'crm@rayons.net';
    
    // Super-Admin gets initial demo set if storage empty; Clients start fresh with clean slate
    setCampaigns(getStoredData(getTenantKey('campaigns', user.id), isSuper ? INITIAL_CAMPAIGNS : []));
    setLeads(getStoredData(getTenantKey('leads', user.id), isSuper ? INITIAL_LEADS : []));
    setMessages(getStoredData(getTenantKey('unibox', user.id), isSuper ? INITIAL_UNIBOX_MESSAGES : []));
    setDeals(getStoredData(getTenantKey('deals', user.id), isSuper ? INITIAL_DEALS : []));
    setWarmupConfig(getStoredData(getTenantKey('warmup', user.id), INITIAL_WARMUP_CONFIG));
    setEmailAccounts(getStoredData(getTenantKey('email_accounts', user.id), isSuper ? INITIAL_EMAIL_ACCOUNTS : []));
    setIsLoaded(true);

    // Asynchronously fetch latest data from Cloud Firestore
    const uid = user.id;
    fetchLeadsFromFirestore(uid).then(cloudLeads => {
      if (cloudLeads && cloudLeads.length > 0) {
        setLeads(cloudLeads);
      }
    }).catch(() => {});

    fetchCampaignsFromFirestore(uid).then(cloudCampaigns => {
      if (cloudCampaigns && cloudCampaigns.length > 0) {
        setCampaigns(cloudCampaigns);
      }
    }).catch(() => {});
  }, [user?.id]);

  // Save to tenant-isolated localStorage & Cloud Firestore on change
  useEffect(() => {
    if (isLoaded && user?.id) {
      setStoredData(getTenantKey('campaigns', user.id), campaigns);
      syncCampaignsToFirestore(user.id, campaigns).catch(() => {});
    }
  }, [campaigns, isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setStoredData(getTenantKey('leads', user.id), leads);
      syncLeadsToFirestore(user.id, leads).catch(() => {});
    }
  }, [leads, isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setStoredData(getTenantKey('unibox', user.id), messages);
    }
  }, [messages, isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setStoredData(getTenantKey('deals', user.id), deals);
    }
  }, [deals, isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setStoredData(getTenantKey('warmup', user.id), warmupConfig);
    }
  }, [warmupConfig, isLoaded, user?.id]);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setStoredData(getTenantKey('email_accounts', user.id), emailAccounts);
    }
  }, [emailAccounts, isLoaded, user?.id]);

  // Campaign methods
  const createCampaign = (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'sentCount' | 'openedCount' | 'clickedCount' | 'repliedCount' | 'interestedCount' | 'bounceCount'>) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: `camp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      sentCount: 0,
      openedCount: 0,
      clickedCount: 0,
      repliedCount: 0,
      interestedCount: 0,
      bounceCount: 0
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    return newCampaign;
  };

  const updateCampaign = (id: string, updates: Partial<Campaign>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
  };

  const toggleCampaignStatus = (id: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'active' ? 'paused' : 'active';
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const addStepToCampaign = (campaignId: string, step: Omit<CampaignStep, 'id' | 'order'>) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newStep: CampaignStep = {
          ...step,
          id: `step-${Date.now()}`,
          order: c.steps.length + 1
        };
        return { ...c, steps: [...c.steps, newStep] };
      }
      return c;
    }));
  };

  const deleteStepFromCampaign = (campaignId: string, stepId: string) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const filtered = c.steps.filter(s => s.id !== stepId);
        const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
        return { ...c, steps: reordered };
      }
      return c;
    }));
  };

  const reorderCampaignSteps = (campaignId: string, newSteps: CampaignStep[]) => {
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const reordered = newSteps.map((s, idx) => ({ ...s, order: idx + 1 }));
        return { ...c, steps: reordered };
      }
      return c;
    }));
  };

  const simulateCampaignSend = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    // Simulate activity: boost stats and add new reply to Unibox
    setCampaigns(prev => prev.map(c => {
      if (c.id === campaignId) {
        const newSent = c.sentCount + 12;
        const newOpened = c.openedCount + 8;
        const newClicked = c.clickedCount + 4;
        const newReplied = c.repliedCount + 2;
        const newInterested = c.interestedCount + 1;
        return {
          ...c,
          sentCount: newSent,
          openedCount: newOpened,
          clickedCount: newClicked,
          repliedCount: newReplied,
          interestedCount: newInterested
        };
      }
      return c;
    }));

    // Add a simulated positive reply to unibox
    const targetLead = leads.find(l => l.campaignId === campaignId || !l.campaignId) || leads[0];
    if (targetLead) {
      const simulatedMsg: UniboxMessage = {
        id: `msg-${Date.now()}`,
        leadId: targetLead.id,
        leadName: `${targetLead.firstName} ${targetLead.lastName}`,
        leadEmail: targetLead.email,
        leadCompany: targetLead.company,
        channel: 'email',
        direction: 'inbound',
        subject: `Re: Découverte pour ${targetLead.company}`,
        snippet: 'Votre proposition tombe très bien. Parlons-en cette semaine !',
        content: `Bonjour,\n\nVotre email et l'approche multicanale personnalisée ont attiré toute mon attention. Notre équipe est ouverte à tester votre solution.\n\nPouvons-nous organiser un appel de 15 minutes ?\n\nCordialement,\n${targetLead.firstName} ${targetLead.lastName}`,
        timestamp: new Date().toISOString(),
        read: false,
        sentiment: 'interested',
        campaignId: campaign.id,
        campaignName: campaign.name
      };
      setMessages(prev => [simulatedMsg, ...prev]);
    }
  };

  // Lead methods
  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt' | 'status' | 'emailVerified' | 'score'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
      emailVerified: true,
      score: Math.floor(Math.random() * 30) + 70,
      tags: leadData.tags || ['Nouveau']
    };
    setLeads(prev => [newLead, ...prev]);
    return newLead;
  };

  const importLeads = (newLeadsData: Partial<Lead>[]) => {
    const created: Lead[] = newLeadsData.map((data, index) => ({
      id: `lead-import-${Date.now()}-${index}`,
      firstName: data.firstName || 'Contact',
      lastName: data.lastName || '',
      email: data.email || `contact${index}@example.com`,
      company: data.company || 'Entreprise',
      jobTitle: data.jobTitle || 'Décideur',
      linkedinUrl: data.linkedinUrl || '',
      phone: data.phone || '',
      website: data.website || '',
      status: 'new',
      tags: data.tags && data.tags.length ? data.tags : ['Import CSV'],
      createdAt: new Date().toISOString(),
      emailVerified: true,
      score: Math.floor(Math.random() * 25) + 75
    }));

    setLeads(prev => [...created, ...prev]);
    return created.length;
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const deleteLead = (id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  };

  const verifyLeadEmail = async (id: string) => {
    const target = leads.find(l => l.id === id);
    if (!target) return;
    const result = await verifyEmailAddress(target.email);
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        return { 
          ...l, 
          emailVerified: result.isValid,
          emailStatus: result.status,
          emailVerificationReason: result.reason,
          score: result.score 
        };
      }
      return l;
    }));
  };

  const verifyAllLeads = async () => {
    let validCount = 0;
    let riskyCount = 0;
    let invalidCount = 0;

    const updatedLeads: Lead[] = [];
    for (const lead of leads) {
      const result = await verifyEmailAddress(lead.email);
      if (result.status === 'valid') validCount++;
      else if (result.status === 'risky') riskyCount++;
      else invalidCount++;

      updatedLeads.push({
        ...lead,
        emailVerified: result.isValid,
        emailStatus: result.status,
        emailVerificationReason: result.reason,
        score: result.score
      });
    }

    setLeads(updatedLeads);
    return {
      verified: updatedLeads.length,
      valid: validCount,
      risky: riskyCount,
      invalid: invalidCount
    };
  };

  const removeInvalidLeads = () => {
    const toKeep = leads.filter(l => l.emailStatus !== 'invalid');
    const removedCount = leads.length - toKeep.length;
    setLeads(toKeep);
    return removedCount;
  };

  // Unibox methods
  const markMessageRead = (messageId: string) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
  };

  const sendReply = (messageId: string, replyText: string) => {
    const original = messages.find(m => m.id === messageId);
    if (!original) return;

    const replyMsg: UniboxMessage = {
      id: `msg-reply-${Date.now()}`,
      leadId: original.leadId,
      leadName: original.leadName,
      leadEmail: original.leadEmail,
      leadCompany: original.leadCompany,
      channel: original.channel,
      direction: 'outbound',
      subject: original.subject?.startsWith('Re:') ? original.subject : `Re: ${original.subject || 'Message'}`,
      snippet: replyText.slice(0, 80) + '...',
      content: replyText,
      timestamp: new Date().toISOString(),
      read: true,
      sentiment: original.sentiment,
      campaignId: original.campaignId,
      campaignName: original.campaignName
    };

    setMessages(prev => [replyMsg, ...prev]);
  };

  const changeMessageSentiment = (messageId: string, sentiment: UniboxMessage['sentiment']) => {
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, sentiment } : m));
  };

  // CRM Deal methods
  const createDeal = (dealData: Omit<Deal, 'id' | 'createdAt'>) => {
    const newDeal: Deal = {
      ...dealData,
      id: `deal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setDeals(prev => [newDeal, ...prev]);
    return newDeal;
  };

  const updateDealStage = (dealId: string, stage: Deal['stage']) => {
    setDeals(prev => prev.map(d => d.id === dealId ? { ...d, stage } : d));
  };

  const deleteDeal = (dealId: string) => {
    setDeals(prev => prev.filter(d => d.id !== dealId));
  };

  // Warmup methods
  const updateWarmupConfig = (updates: Partial<WarmupConfig>) => {
    setWarmupConfig(prev => ({ ...prev, ...updates }));
  };

  const simulateWarmupRound = () => {
    setWarmupConfig(prev => ({
      ...prev,
      dailyWarmupSent: Math.min(prev.dailyWarmupTarget, prev.dailyWarmupSent + 2),
      inboxPlacementRate: Math.min(99.4, +(prev.inboxPlacementRate + 0.2).toFixed(1)),
      currentScore: Math.min(100, prev.currentScore + 1)
    }));
  };

  // Email Accounts Management
  const addEmailAccount = (accountData: Omit<EmailAccount, 'id' | 'createdAt'>) => {
    const newAccount: EmailAccount = {
      ...accountData,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setEmailAccounts(prev => {
      // If first account or set as default, unset previous defaults
      if (newAccount.isDefault || prev.length === 0) {
        return [...prev.map(a => ({ ...a, isDefault: false })), { ...newAccount, isDefault: true }];
      }
      return [...prev, newAccount];
    });
    return newAccount;
  };

  const updateEmailAccount = (id: string, updates: Partial<EmailAccount>) => {
    setEmailAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        return { ...acc, ...updates };
      }
      if (updates.isDefault && acc.id !== id) {
        return { ...acc, isDefault: false };
      }
      return acc;
    }));
  };

  const deleteEmailAccount = (id: string) => {
    setEmailAccounts(prev => prev.filter(a => a.id !== id));
  };

  const setDefaultEmailAccount = (id: string) => {
    setEmailAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  const testEmailAccount = async (id: string): Promise<{ success: boolean; message: string }> => {
    const account = emailAccounts.find(a => a.id === id);
    if (!account) return { success: false, message: 'Compte introuvable' };

    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost: account.smtpHost,
          smtpPort: account.smtpPort,
          smtpSecure: account.smtpSecure,
          smtpUser: account.smtpUser,
          smtpPass: account.smtpPass
        })
      });

      const data = await res.json();
      if (data.success) {
        updateEmailAccount(id, {
          status: 'connected',
          lastTested: new Date().toISOString(),
          errorMessage: undefined
        });
        return { success: true, message: data.message };
      } else {
        updateEmailAccount(id, {
          status: 'error',
          lastTested: new Date().toISOString(),
          errorMessage: data.error
        });
        return { success: false, message: data.error };
      }
    } catch (err: any) {
      updateEmailAccount(id, {
        status: 'error',
        lastTested: new Date().toISOString(),
        errorMessage: err.message
      });
      return { success: false, message: err.message || 'Erreur réseau' };
    }
  };

  // Live Campaign Outreach via Connected SMTP
  const sendCampaignEmailLive = async (
    campaignId: string, 
    leadId: string, 
    customSubject?: string, 
    customBody?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const campaign = campaigns.find(c => c.id === campaignId);
    const lead = leads.find(l => l.id === leadId);
    const defaultAcc = emailAccounts.find(a => a.isDefault) || emailAccounts[0];

    if (!lead || !lead.email) {
      return { success: false, error: 'Prospect ou email manquant' };
    }

    const firstStep = campaign?.steps.find(s => s.type === 'email_send') || campaign?.steps[0];
    const subject = customSubject || firstStep?.subject || `Opportunité pour {{company}}`;
    const body = customBody || firstStep?.body || `Bonjour {{firstName}},\n\nJ'ai découvert {{company}} et souhaite échanger avec vous.`;

    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpConfig: defaultAcc ? {
            smtpHost: defaultAcc.smtpHost,
            smtpPort: defaultAcc.smtpPort,
            smtpSecure: defaultAcc.smtpSecure,
            smtpUser: defaultAcc.smtpUser,
            smtpPass: defaultAcc.smtpPass
          } : undefined,
          fromName: defaultAcc?.name || 'Daniel Kiboko',
          fromEmail: defaultAcc?.email || 'danielkiboko218@gmail.com',
          toEmail: lead.email,
          toName: `${lead.firstName} ${lead.lastName}`.trim(),
          subject,
          textBody: body,
          leadVariables: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            company: lead.company,
            jobTitle: lead.jobTitle,
            customVariables: lead.customVariables
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        // Update lead status
        updateLead(lead.id, {
          status: 'in_progress',
          lastActivity: new Date().toISOString()
        });

        // Update campaign counters
        if (campaign) {
          updateCampaign(campaign.id, {
            sentCount: (campaign.sentCount || 0) + 1,
            status: 'active'
          });
        }
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const sendBulkCampaignLive = async (
    campaignId: string, 
    onProgress?: (sent: number, total: number) => void
  ): Promise<{ sent: number; failed: number }> => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return { sent: 0, failed: 0 };

    // Find leads assigned to this campaign or all valid leads
    const targetLeads = leads.filter(l => (l.campaignId === campaignId || !l.campaignId) && l.email);
    let sentCount = 0;
    let failedCount = 0;

    for (let i = 0; i < targetLeads.length; i++) {
      const lead = targetLeads[i];
      const res = await sendCampaignEmailLive(campaignId, lead.id);
      if (res.success) {
        sentCount++;
      } else {
        failedCount++;
      }
      if (onProgress) {
        onProgress(i + 1, targetLeads.length);
      }
    }

    return { sent: sentCount, failed: failedCount };
  };

  const syncInboxReplies = async (): Promise<{ success: boolean; newCount: number }> => {
    const defaultAcc = emailAccounts.find(a => a.isDefault) || emailAccounts[0];
    try {
      const res = await fetch('/api/email/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAccount: defaultAcc })
      });

      const data = await res.json();
      if (data.success && data.mockReply) {
        // Add new reply to messages if not already there
        const alreadyExists = messages.some(m => m.leadEmail === data.mockReply.leadEmail && m.subject === data.mockReply.subject);
        if (!alreadyExists) {
          setMessages(prev => [data.mockReply, ...prev]);
          return { success: true, newCount: 1 };
        }
      }
      return { success: true, newCount: 0 };
    } catch (e) {
      return { success: false, newCount: 0 };
    }
  };

  return (
    <CrmContext.Provider
      value={{
        campaigns,
        leads,
        messages,
        deals,
        warmupConfig,
        imageTemplates,
        emailAccounts,
        addEmailAccount,
        updateEmailAccount,
        deleteEmailAccount,
        setDefaultEmailAccount,
        testEmailAccount,
        sendCampaignEmailLive,
        sendBulkCampaignLive,
        syncInboxReplies,
        createCampaign,
        updateCampaign,
        deleteCampaign,
        toggleCampaignStatus,
        addStepToCampaign,
        deleteStepFromCampaign,
        reorderCampaignSteps,
        simulateCampaignSend,
        addLead,
        importLeads,
        updateLead,
        deleteLead,
        verifyLeadEmail,
        verifyAllLeads,
        removeInvalidLeads,
        markMessageRead,
        sendReply,
        changeMessageSentiment,
        createDeal,
        updateDealStage,
        deleteDeal,
        updateWarmupConfig,
        simulateWarmupRound
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}
