-- ==============================================================================
-- RISHTAY MATRIMONY — PRODUCTION ADMIN & VERIFICATION SYSTEM SCHEMA
-- Run this in the Supabase SQL Editor for project fmionvehanyfwhshkhbd
-- ==============================================================================

-- 1. Create custom enum types if not exists
DO $$ BEGIN
  CREATE TYPE admin_role_type AS ENUM ('super_admin', 'profile_reviewer', 'membership_manager', 'read_only_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE review_status_type AS ENUM ('pending', 'approved', 'rejected', 'needs_correction');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE verification_status_type AS ENUM ('pending', 'verified', 'rejected', 'needs_info');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Extend Profiles / Users table
ALTER TABLE IF EXISTS public.users
  ADD COLUMN IF NOT EXISTS review_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS identity_status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS selfie_status TEXT DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS reviewed_by TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS correction_notes TEXT,
  ADD COLUMN IF NOT EXISTS internal_notes TEXT,
  ADD COLUMN IF NOT EXISTS registered_relationship TEXT DEFAULT 'Self',
  ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS premium_plan TEXT,
  ADD COLUMN IF NOT EXISTS premium_until TIMESTAMPTZ;

-- 3. Administrator Accounts table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'super_admin',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  assignment_method TEXT NOT NULL DEFAULT 'manual',
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'paid',
  payment_reference TEXT,
  assigned_by TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Payments Ledger table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id TEXT NOT NULL,
  profile_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'confirmed',
  transaction_id TEXT,
  is_manual BOOLEAN NOT NULL DEFAULT TRUE,
  recorded_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Profile Review History table
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  admin_id TEXT NOT NULL,
  admin_email TEXT NOT NULL,
  decision TEXT NOT NULL,
  reason TEXT,
  user_message TEXT,
  internal_notes TEXT,
  checklist_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Identity Documents table (Restricted Storage & Verification)
CREATE TABLE IF NOT EXISTS public.identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT NOT NULL,
  doc_type TEXT NOT NULL DEFAULT 'Aadhaar Card',
  masked_id TEXT,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id TEXT,
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Audit Logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT,
  admin_email TEXT,
  admin_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details_json JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Google Sheets Synchronization Log table
CREATE TABLE IF NOT EXISTS public.google_sheets_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id TEXT UNIQUE NOT NULL,
  sheet_row_id TEXT,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_sheets_sync ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is an active admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE auth_user_id = auth.uid()
      AND active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin Users Policies: Only super admins can view and update admin users
CREATE POLICY admin_users_policy ON public.admin_users
  FOR ALL
  USING (public.is_admin());

-- Subscriptions Policies: Members can view their own, Admins can view/manage all
CREATE POLICY subscriptions_admin_policy ON public.subscriptions
  FOR ALL
  USING (public.is_admin());

CREATE POLICY subscriptions_user_view_policy ON public.subscriptions
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- Payments Policies: Admins can view all, members can only view their own
CREATE POLICY payments_admin_policy ON public.payments
  FOR ALL
  USING (public.is_admin());

-- Identity Documents: Strictly restricted to authorized admins
CREATE POLICY identity_documents_admin_policy ON public.identity_documents
  FOR ALL
  USING (public.is_admin());

-- Audit Logs: Insertable by admins, readable only by admins
CREATE POLICY audit_logs_admin_policy ON public.audit_logs
  FOR ALL
  USING (public.is_admin());
