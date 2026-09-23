/**
 * Module Métier CRM Client (CRM Rayons)
 * 
 * Ce service regroupe toutes les opérations courantes pour l'espace CRM :
 * - Prospection & Envoi de campagnes (Email, LinkedIn, SMS, RCS)
 * - Gestion des prospects (Leads) et imports CSV/Excel
 * - Pipeline commercial & Opportunités (Deals)
 * - Boîte de réception unifiée (Unibox)
 * - Chauffe d'adresses emails (Warmup / Lemwarm)
 */

import { Lead, Campaign, UniboxMessage, Deal } from '@/types';

export const CrmService = {
  filterLeads(leads: Lead[], query: string, status?: string): Lead[] {
    const q = query.trim().toLowerCase();
    return leads.filter(lead => {
      const fullName = `${lead.firstName || ''} ${lead.lastName || ''}`.toLowerCase();
      const matchQuery = !q || 
        fullName.includes(q) || 
        (lead.email && lead.email.toLowerCase().includes(q)) || 
        (lead.company && lead.company.toLowerCase().includes(q));
      const matchStatus = !status || status === 'all' || lead.status === status;
      return matchQuery && matchStatus;
    });
  },

  calculateCampaignStats(campaigns: Campaign[]) {
    const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const totalOpened = campaigns.reduce((acc, c) => acc + (c.openedCount || 0), 0);
    const totalReplied = campaigns.reduce((acc, c) => acc + (c.repliedCount || 0), 0);
    const totalClicked = campaigns.reduce((acc, c) => acc + (c.clickedCount || 0), 0);

    const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
    const replyRate = totalSent > 0 ? Math.round((totalReplied / totalSent) * 100) : 0;

    return {
      totalSent,
      totalOpened,
      totalReplied,
      totalClicked,
      openRate,
      replyRate
    };
  },

  calculatePipelineValue(deals: Deal[]): number {
    return deals.reduce((acc, d) => acc + (d.value || 0), 0);
  }
};
