-- ==============================================================================
-- RISHTAY MATRIMONY — COMPLETE PRODUCTION DATABASE SCHEMA FOR SUPABASE (POSTGRESQL)
-- Project: Risthay (Halal Muslim Matrimony)
--
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/fmionvehanyfwhshkhbd
-- 2. Navigate to "SQL Editor" on the left menu.
-- 3. Paste this entire script and click "Run".
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE admin_role_type AS ENUM ('super_admin', 'profile_reviewer', 'membership_manager', 'read_only_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE review_status_type AS ENUM ('pending', 'approved', 'rejected', 'needs_correction');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE identity_status_type AS ENUM ('pending', 'verified', 'rejected', 'needs_info');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE selfie_status_type AS ENUM ('verified', 'needs_manual_review', 'rejected', 'needs_info');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status_type AS ENUM ('active', 'expired', 'cancelled', 'pending');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status_type AS ENUM ('confirmed', 'pending', 'failed', 'refunded');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. USERS / CANDIDATES PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id                      TEXT PRIMARY KEY,
  supabase_user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  phone                   TEXT UNIQUE,
  email                   TEXT,
  password_hash           TEXT,
  name                    TEXT NOT NULL,
  age                     INTEGER,
  dob                     DATE,
  gender                  TEXT,
  city                    TEXT,
  state                   TEXT,
  country                 TEXT NOT NULL DEFAULT 'India',
  profession              TEXT,
  education               TEXT,
  religious_practice      TEXT,
  marital_status          TEXT,
  verified                BOOLEAN NOT NULL DEFAULT FALSE,
  avatar                  TEXT,
  role                    TEXT NOT NULL DEFAULT 'member',
  is_demo                 BOOLEAN NOT NULL DEFAULT FALSE,
  onboarded               BOOLEAN NOT NULL DEFAULT FALSE,
  status                  TEXT NOT NULL DEFAULT 'pending',
  review_status           TEXT NOT NULL DEFAULT 'pending',
  identity_status         TEXT NOT NULL DEFAULT 'pending',
  selfie_status           TEXT NOT NULL DEFAULT 'needs_manual_review',
  registered_relationship TEXT NOT NULL DEFAULT 'Self',
  reviewed_by             TEXT,
  reviewed_at             TIMESTAMPTZ,
  rejection_reason        TEXT,
  correction_notes        TEXT,
  internal_notes          TEXT,
  is_premium              BOOLEAN NOT NULL DEFAULT FALSE,
  premium_plan            TEXT,
  premium_until           TIMESTAMPTZ,
  profile_json            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. ADMINISTRATOR ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
  id            TEXT PRIMARY KEY DEFAULT ('admin-' || gen_random_uuid()),
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'super_admin',
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  token       TEXT PRIMARY KEY,
  admin_id    TEXT NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  role        TEXT NOT NULL,
  user_agent  TEXT,
  ip          TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at  TIMESTAMPTZ NOT NULL
);

-- 6. PROFILE REVIEWS & DECISIONS AUDIT LEDGER
CREATE TABLE IF NOT EXISTS public.profile_reviews (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id     TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  admin_id       TEXT NOT NULL,
  admin_email    TEXT NOT NULL,
  decision       TEXT NOT NULL, -- 'approved', 'rejected', 'needs_correction'
  reason         TEXT,
  user_message   TEXT,
  internal_notes TEXT,
  checklist_json JSONB,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                TEXT PRIMARY KEY DEFAULT ('sub-' || gen_random_uuid()),
  user_id           TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id        TEXT NOT NULL,
  plan_id           TEXT NOT NULL,
  plan_name         TEXT NOT NULL,
  amount            INTEGER NOT NULL DEFAULT 0,
  start_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date          TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active',
  assignment_method TEXT NOT NULL DEFAULT 'manual',
  payment_method    TEXT,
  payment_status    TEXT NOT NULL DEFAULT 'paid',
  payment_reference TEXT,
  assigned_by       TEXT NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id              TEXT PRIMARY KEY DEFAULT ('pay-' || gen_random_uuid()),
  subscription_id TEXT REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  user_id         TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id      TEXT NOT NULL,
  amount          INTEGER NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'INR',
  payment_method  TEXT NOT NULL,
  payment_status  TEXT NOT NULL DEFAULT 'confirmed',
  transaction_id  TEXT,
  is_manual       BOOLEAN NOT NULL DEFAULT TRUE,
  recorded_by     TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. AUDIT LOGS (ADMIN ACTIVITY TRAIL)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id     TEXT,
  admin_email  TEXT,
  admin_name   TEXT,
  action       TEXT NOT NULL,
  target_type  TEXT NOT NULL,
  target_id    TEXT NOT NULL,
  details_json JSONB,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id         TEXT PRIMARY KEY DEFAULT ('notif-' || gen_random_uuid()),
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  data       JSONB,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ADMIN NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id         TEXT PRIMARY KEY DEFAULT ('admin-notif-' || gen_random_uuid()),
  profile_id TEXT,
  user_id    TEXT,
  type       TEXT NOT NULL,
  channel    TEXT NOT NULL DEFAULT 'in_app',
  recipient  TEXT NOT NULL DEFAULT 'admin',
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'delivered',
  error      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. INTERACTIONS: INTERESTS, SHORTLISTS, BLOCKS, REPORTS
CREATE TABLE IF NOT EXISTS public.interests (
  id         TEXT PRIMARY KEY DEFAULT ('int-' || gen_random_uuid()),
  from_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  to_id      TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status     TEXT NOT NULL DEFAULT 'pending',
  note       TEXT,
  reason     TEXT,
  blocked    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_id, to_id)
);

CREATE TABLE IF NOT EXISTS public.shortlists (
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.blocks (
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(user_id, blocked_id)
);

CREATE TABLE IF NOT EXISTS public.reports (
  id          TEXT PRIMARY KEY DEFAULT ('rep-' || gen_random_uuid()),
  reporter_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason      TEXT NOT NULL,
  details     TEXT,
  status      TEXT NOT NULL DEFAULT 'open',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. CHATS & MESSAGES
CREATE TABLE IF NOT EXISTS public.chats (
  id         TEXT PRIMARY KEY DEFAULT ('chat-' || gen_random_uuid()),
  user_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  peer_id    TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  unread     INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, peer_id)
);

CREATE TABLE IF NOT EXISTS public.messages (
  id         TEXT PRIMARY KEY DEFAULT ('msg-' || gen_random_uuid()),
  chat_id    TEXT NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender     TEXT NOT NULL,
  text       TEXT NOT NULL,
  read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  user_id           TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  global_photo_blur BOOLEAN NOT NULL DEFAULT FALSE,
  hide_name         BOOLEAN NOT NULL DEFAULT FALSE,
  wali_in_chat      BOOLEAN NOT NULL DEFAULT TRUE,
  notify_matches    BOOLEAN NOT NULL DEFAULT TRUE,
  notify_messages   BOOLEAN NOT NULL DEFAULT TRUE,
  notify_interests  BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
  key        TEXT PRIMARY KEY,
  value_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. PERFORMANCE INDICES
CREATE INDEX IF NOT EXISTS idx_users_review_status ON public.users(review_status);
CREATE INDEX IF NOT EXISTS idx_users_status        ON public.users(status);
CREATE INDEX IF NOT EXISTS idx_users_gender        ON public.users(gender);
CREATE INDEX IF NOT EXISTS idx_users_city          ON public.users(city);
CREATE INDEX IF NOT EXISTS idx_users_state         ON public.users(state);
CREATE INDEX IF NOT EXISTS idx_users_supabase      ON public.users(supabase_user_id);
CREATE INDEX IF NOT EXISTS idx_interests_to        ON public.interests(to_id, status);
CREATE INDEX IF NOT EXISTS idx_interests_from      ON public.interests(from_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user  ON public.subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_user       ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action   ON public.audit_logs(action, created_at);

-- 16. AUTO-UPDATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 17. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shortlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Approved profiles are public to authenticated matrimony members
CREATE POLICY "Public approved profiles viewable by everyone"
  ON public.users FOR SELECT
  USING (review_status = 'approved' AND status = 'active');

-- Users can view and edit their own profile even when pending
CREATE POLICY "Users can manage own profile"
  ON public.users FOR ALL
  USING (auth.uid() = supabase_user_id OR id = current_setting('request.jwt.claim.sub', true));

-- 18. SEED SYED ADMIN ACCOUNT
-- Generates super_admin syed@risthay with syed@risthay@2026
INSERT INTO public.admin_users (id, email, password_hash, name, role, active, created_at, updated_at)
VALUES (
  'admin-syed',
  'syed@risthay',
  'scrypt$b0d912ec9f4a13e734bc1a4e10476839$b210f82df9db37324cbe2ad37ef95a7ec8371c64eb372d6f7a637559e81b6aa2bbcb661904a434c38d5db2f4a478832a819d9b6da12d3c90e66eb137452d3d95',
  'Syed (Administrator)',
  'super_admin',
  TRUE,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET active = TRUE, role = 'super_admin';
