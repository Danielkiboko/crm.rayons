/**
 * Supabase Data Service
 * CRM Rayons SaaS Outreach Platform
 */

import { supabase, isSupabaseConfigured } from './supabase';
import { User, Lead, Campaign } from '@/types';

// ================= USERS =================

export async function fetchUsersFromSupabase(): Promise<User[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error || !data) return [];
    return data.map((u: any) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyName: u.company_name,
      status: u.status,
      subscriptionPlan: u.subscription_plan,
      subscriptionPrice: u.subscription_price,
      subscriptionStatus: u.subscription_status,
      trialEndsAt: u.trial_ends_at,
      smppCredits: u.smpp_credits,
      rcsCredits: u.rcs_credits,
      dailyEmailLimit: u.daily_email_limit,
      hasSmsUpgrade: u.has_sms_upgrade,
      hasRcsUpgrade: u.has_rcs_upgrade,
      hasLinkedinUpgrade: u.has_linkedin_upgrade,
      createdAt: u.created_at
    }));
  } catch (err) {
    console.error('Supabase fetchUsers error:', err);
    return [];
  }
}

export async function syncUserToSupabase(user: User): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      company_name: user.companyName,
      status: user.status,
      subscription_plan: user.subscriptionPlan,
      subscription_price: user.subscriptionPrice,
      subscription_status: user.subscriptionStatus,
      trial_ends_at: user.trialEndsAt || null,
      smpp_credits: user.smppCredits,
      rcs_credits: user.rcsCredits,
      daily_email_limit: user.dailyEmailLimit,
      has_sms_upgrade: user.hasSmsUpgrade,
      has_rcs_upgrade: user.hasRcsUpgrade,
      has_linkedin_upgrade: user.hasLinkedinUpgrade
    };

    const { error } = await supabase.from('users').upsert(payload, { onConflict: 'email' });
    if (error) {
      console.error('Supabase syncUser error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase syncUser error:', err);
    return false;
  }
}

export async function deleteUserFromSupabase(userId: string): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) {
      console.error('Supabase deleteUser error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase deleteUser error:', err);
    return false;
  }
}

// ================= LEADS =================

export async function fetchLeadsFromSupabase(): Promise<Lead[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase.from('leads').select('*');
    if (error || !data) return [];
    return data.map((l: any) => ({
      id: l.id,
      userId: l.user_id,
      campaignId: l.campaign_id,
      firstName: l.first_name,
      lastName: l.last_name,
      email: l.email,
      phone: l.phone,
      company: l.company,
      jobTitle: l.job_title,
      linkedinUrl: l.linkedin_url,
      website: l.website,
      status: l.status,
      deliveryStatus: l.delivery_status,
      deliveryDate: l.delivery_date,
      deliveryError: l.delivery_error,
      score: l.score,
      emailVerified: l.email_verified,
      tags: l.tags || [],
      customVariables: l.custom_variables || {},
      createdAt: l.created_at
    }));
  } catch (err) {
    console.error('Supabase fetchLeads error:', err);
    return [];
  }
}

export async function syncLeadsToSupabase(leads: Lead[]): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || leads.length === 0) return false;
  try {
    const payloads = leads.map(l => ({
      id: l.id,
      campaign_id: l.campaignId || null,
      first_name: l.firstName,
      last_name: l.lastName || '',
      email: l.email || '',
      phone: l.phone || null,
      company: l.company || 'Entreprise',
      job_title: l.jobTitle || 'Décideur',
      linkedin_url: l.linkedinUrl || null,
      website: l.website || null,
      status: l.status || 'new',
      delivery_status: l.deliveryStatus || 'pending',
      delivery_date: l.deliveryDate || null,
      delivery_error: l.deliveryError || null,
      score: l.score || 75,
      email_verified: l.emailVerified || false,
      tags: l.tags || ['Import'],
      custom_variables: l.customVariables || {}
    }));

    const { error } = await supabase.from('leads').upsert(payloads, { onConflict: 'id' });
    if (error) {
      console.error('Supabase syncLeads error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase syncLeads error:', err);
    return false;
  }
}

// ================= CAMPAIGNS =================

export async function fetchCampaignsFromSupabase(): Promise<Campaign[]> {
  if (!isSupabaseConfigured || !supabase) return [];
  try {
    const { data, error } = await supabase.from('campaigns').select('*');
    if (error || !data) return [];
    return data.map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      senderAccounts: c.sender_accounts || [],
      steps: c.steps || [],
      sentCount: c.sent_count || 0,
      openedCount: c.opened_count || 0,
      clickedCount: c.clicked_count || 0,
      repliedCount: c.replied_count || 0,
      interestedCount: c.interested_count || 0,
      bounceCount: c.bounce_count || 0,
      dailyLimit: c.daily_limit || 40,
      timezone: c.timezone || 'Africa/Kinshasa',
      createdAt: c.created_at
    }));
  } catch (err) {
    console.error('Supabase fetchCampaigns error:', err);
    return [];
  }
}

export async function syncCampaignToSupabase(campaign: Campaign): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  try {
    const payload = {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      sender_accounts: campaign.senderAccounts || [],
      steps: campaign.steps || [],
      sent_count: campaign.sentCount || 0,
      opened_count: campaign.openedCount || 0,
      clicked_count: campaign.clickedCount || 0,
      replied_count: campaign.repliedCount || 0,
      interested_count: campaign.interestedCount || 0,
      bounce_count: campaign.bounceCount || 0,
      daily_limit: campaign.dailyLimit || 40,
      timezone: campaign.timezone || 'Africa/Kinshasa'
    };

    const { error } = await supabase.from('campaigns').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error('Supabase syncCampaign error:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase syncCampaign error:', err);
    return false;
  }
}
