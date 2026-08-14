-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES & USER PREFERENCES TABLE
-- ============================================================================
-- Extends your existing `users` table (1-to-1 relationship).
-- Modify `auth.users` below if your user table lives in `public.users`.
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Display & Profile Metadata
    avatar_url TEXT CHECK (avatar_url ~* '^https?://'),
    bio TEXT CHECK (char_length(bio) <= 500),
    
    -- Regional Formatting & Localization
    currency VARCHAR(3) NOT NULL DEFAULT 'USD' CHECK (currency ~ '^[A-Z]{3}$'),
    locale VARCHAR(10) NOT NULL DEFAULT 'en-US' CHECK (locale ~ '^[a-z]{2}(-[A-Z]{2})?$'),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    date_format VARCHAR(20) NOT NULL DEFAULT 'YYYY-MM-DD',
    time_format VARCHAR(5) NOT NULL DEFAULT '24h' CHECK (time_format IN ('12h', '24h')),
    
    -- Dynamic App Settings / UI Preferences (Gives flexibility without constant schema migrations)
    settings JSONB NOT NULL DEFAULT '{
        "theme": "system",
        "notifications": {
            "email_digest": true,
            "push_enabled": false,
            "marketing": false
        },
        "default_dashboard_view": "overview"
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Indexing for profile lookup & fast querying
CREATE INDEX idx_profiles_currency ON public.profiles(currency);
CREATE INDEX idx_profiles_settings_gin ON public.profiles USING GIN (settings);


-- 1. Enable Row Level Security on the table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to SELECT (read) only their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING ( (select auth.uid()) = id );

-- 3. Allow users to UPDATE only their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING ( (select auth.uid()) = id )
WITH CHECK ( (select auth.uid()) = id );

-- 4. Allow users to INSERT their own profile (or handled via DB Trigger)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK ( (select auth.uid()) = id );

-- ============================================================================
-- 2. EXCHANGE RATES TABLE (Frankfurter API Sync Target)
-- ============================================================================
-- Stores currency exchange rates synced from Frankfurter API using EUR as the Base Currency.
CREATE TABLE public.exchange_rates (
    currency VARCHAR(3) PRIMARY KEY CHECK (currency ~ '^[A-Z]{3}$'),
    rate_from_usd NUMERIC(18, 6) NOT NULL CHECK (rate_from_usd > 0), -- e.g., 1.085200 USD per 1 EUR
    rate_date DATE NOT NULL,                                          -- Date reported by Frankfurter
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Base Reference Rate (1 EUR = 1 EUR)
INSERT INTO public.exchange_rates (currency, rate_from_eur, rate_date) 
VALUES ('USD', 1.000000, CURRENT_DATE)
ON CONFLICT (currency) DO NOTHING;

CREATE INDEX idx_exchange_rates_synced ON public.exchange_rates(synced_at);


-- ============================================================================
-- 3. TRANSACTIONS / FINANCIAL DATA (Base EUR Storage)
-- ============================================================================
-- Rule: Transactions are saved in base integer micro-units (EUR Cents: €10.00 = 1000) 
-- to prevent floating-point rounding bugs.
CREATE TABLE public.user_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount_in_eur_cents BIGINT NOT NULL CHECK (amount_in_eur_cents >= 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON public.user_transactions(user_id);


-- ============================================================================
-- 4. AUTOMATED UPDATED_AT TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================================
-- 5. DYNAMIC TRANSACTION LOCALIZATION VIEW
-- ============================================================================
-- Automatically calculates localized currency totals on read using user preferences and Frankfurter exchange rates.
CREATE OR REPLACE VIEW public.vw_user_transactions_localized AS
SELECT 
    t.id AS transaction_id,
    t.user_id,
    t.description,
    p.currency AS preferred_currency,
    p.locale,
    -- Convert Base EUR Cents to Standard Currency in User's Preferred Currency
    ROUND(
        (t.amount_in_eur_cents / 100.0) * COALESCE(er.rate_from_eur, 1.0), 
        2
    ) AS converted_amount,
    t.created_at
FROM public.user_transactions t
JOIN public.profiles p ON t.user_id = p.id
LEFT JOIN public.exchange_rates er ON er.currency = p.currency;


-- ============================================================================
-- 2. AUTOMATED TIMESTAMP TRIGGER
-- ============================================================================
-- Automatically updates `updated_at` whenever a profile row is modified
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();


-- ============================================================================
-- 3. AUTOMATIC PROFILE CREATION ON SIGNUP
-- ============================================================================
-- Automatically inserts a default profile row when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


  -- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
-- Protects data so users can only access their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING ((select auth.uid()) = id)
WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK ((select auth.uid()) = id);