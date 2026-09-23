-- ========================================================
-- CRM RAYONS SAAS — SCHÉMA POSTGRESQL POUR SUPABASE
-- ========================================================

-- 1. Table des Utilisateurs & Abonnements SaaS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin', -- 'superadmin' | 'admin' | 'user'
  company_name TEXT DEFAULT 'Entreprise',
  status TEXT DEFAULT 'active', -- 'active' | 'suspended' | 'trial'
  subscription_plan TEXT DEFAULT 'trial', -- 'trial' | 'pro_monthly' | 'lifetime'
  subscription_price NUMERIC DEFAULT 30,
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  smpp_credits INTEGER DEFAULT 1000,
  rcs_credits INTEGER DEFAULT 1000,
  daily_email_limit INTEGER DEFAULT 100,
  has_sms_upgrade BOOLEAN DEFAULT false,
  has_rcs_upgrade BOOLEAN DEFAULT false,
  has_linkedin_upgrade BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Table des Prospects & Contacts (Leads)
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  campaign_id TEXT,
  first_name TEXT DEFAULT 'Contact',
  last_name TEXT DEFAULT '',
  email TEXT,
  phone TEXT,
  company TEXT DEFAULT 'Entreprise',
  job_title TEXT DEFAULT 'Décideur',
  linkedin_url TEXT,
  website TEXT,
  status TEXT DEFAULT 'new', -- 'new' | 'in_progress' | 'replied' | 'converted' | 'bounced'
  delivery_status TEXT DEFAULT 'pending', -- 'delivered' | 'failed' | 'pending'
  delivery_date TEXT,
  delivery_error TEXT,
  score INTEGER DEFAULT 75,
  email_verified BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT ARRAY['Import'],
  custom_variables JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Table des Campagnes Multicanales
CREATE TABLE IF NOT EXISTS public.campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'draft', -- 'draft' | 'active' | 'paused' | 'completed'
  sender_accounts TEXT[] DEFAULT ARRAY[]::text[],
  steps JSONB DEFAULT '[]'::jsonb,
  sent_count INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  replied_count INTEGER DEFAULT 0,
  interested_count INTEGER DEFAULT 0,
  bounce_count INTEGER DEFAULT 0,
  daily_limit INTEGER DEFAULT 40,
  timezone TEXT DEFAULT 'Africa/Kinshasa',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Table des Passerelles Télécom (SMSC & Google RCS RBM)
CREATE TABLE IF NOT EXISTS public.telecom_routes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL, -- 'sms' | 'rcs'
  endpoint_url TEXT NOT NULL,
  auth_type TEXT DEFAULT 'bearer',
  api_token TEXT,
  sender_id TEXT DEFAULT 'RAYONS',
  rcs_bot_id TEXT,
  status TEXT DEFAULT 'active',
  tps_limit INTEGER DEFAULT 50,
  webhook_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Table des Messages Reçus Unibox
CREATE TABLE IF NOT EXISTS public.unibox_messages (
  id TEXT PRIMARY KEY,
  lead_id TEXT,
  lead_name TEXT,
  lead_email TEXT,
  lead_company TEXT,
  channel TEXT NOT NULL, -- 'email' | 'sms' | 'rcs' | 'linkedin'
  direction TEXT DEFAULT 'inbound',
  subject TEXT,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  sentiment TEXT DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Insertion du Super-Administrateur Maître (Daniel Kiboko)
INSERT INTO public.users (
  id,
  name,
  email,
  role,
  company_name,
  status,
  subscription_plan,
  subscription_status,
  smpp_credits,
  rcs_credits,
  has_sms_upgrade,
  has_rcs_upgrade,
  has_linkedin_upgrade
) VALUES (
  'superadmin-daniel-kiboko',
  'Daniel Kiboko',
  'danielkiboko218@gmail.com',
  'superadmin',
  'CRM Rayons SaaS',
  'active',
  'lifetime',
  'pro_active',
  100000,
  50000,
  true,
  true,
  true
) ON CONFLICT (email) DO UPDATE SET
  role = 'superadmin',
  subscription_plan = 'lifetime',
  has_sms_upgrade = true,
  has_rcs_upgrade = true;

-- Activation de Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telecom_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unibox_messages ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture / écriture permissives pour l'API
CREATE POLICY "Allow anon read/write for CRM operations" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow anon read/write for leads" ON public.leads FOR ALL USING (true);
CREATE POLICY "Allow anon read/write for campaigns" ON public.campaigns FOR ALL USING (true);
CREATE POLICY "Allow anon read/write for telecom_routes" ON public.telecom_routes FOR ALL USING (true);
CREATE POLICY "Allow anon read/write for unibox_messages" ON public.unibox_messages FOR ALL USING (true);
