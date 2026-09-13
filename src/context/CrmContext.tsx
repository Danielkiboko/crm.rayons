'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Campaign, Lead, UniboxMessage, Deal, WarmupConfig, ImageTemplate, CampaignStep } from '@/types';
import { 
  INITIAL_CAMPAIGNS, 
  INITIAL_LEADS, 
  INITIAL_UNIBOX_MESSAGES, 
  INITIAL_DEALS, 
  INITIAL_WARMUP_CONFIG, 
  INITIAL_IMAGE_TEMPLATES,
  getStoredData,
  setStoredData
} from '@/lib/storage';
import { verifyEmailAddress } from '@/lib/emailVerifier';

interface CrmContextType {
  campaigns: Campaign[];
  leads: Lead[];
  messages: UniboxMessage[];
  deals: Deal[];
  warmupConfig: WarmupConfig;
  imageTemplates: ImageTemplate[];
  
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
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [messages, setMessages] = useState<UniboxMessage[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [warmupConfig, setWarmupConfig] = useState<WarmupConfig>(INITIAL_WARMUP_CONFIG);
  const [imageTemplates] = useState<ImageTemplate[]>(INITIAL_IMAGE_TEMPLATES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    setCampaigns(getStoredData('lemlist_crm_campaigns', INITIAL_CAMPAIGNS));
    setLeads(getStoredData('lemlist_crm_leads', INITIAL_LEADS));
    setMessages(getStoredData('lemlist_crm_unibox', INITIAL_UNIBOX_MESSAGES));
    setDeals(getStoredData('lemlist_crm_deals', INITIAL_DEALS));
    setWarmupConfig(getStoredData('lemlist_crm_warmup', INITIAL_WARMUP_CONFIG));
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      setStoredData('lemlist_crm_campaigns', campaigns);
    }
  }, [campaigns, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setStoredData('lemlist_crm_leads', leads);
    }
  }, [leads, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setStoredData('lemlist_crm_unibox', messages);
    }
  }, [messages, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setStoredData('lemlist_crm_deals', deals);
    }
  }, [deals, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      setStoredData('lemlist_crm_warmup', warmupConfig);
    }
  }, [warmupConfig, isLoaded]);

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

  return (
    <CrmContext.Provider
      value={{
        campaigns,
        leads,
        messages,
        deals,
        warmupConfig,
        imageTemplates,
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
