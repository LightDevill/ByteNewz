-- Migration: Initial Profiles Table, Hardened Triggers, and RLS Policies
-- Phase: 01-foundation-and-auth
-- Plan: 02

-- 1. Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL CHECK (username ~ '^[a-z0-9_]{3,30}$'),
  display_name TEXT NOT NULL CHECK (length(trim(display_name)) BETWEEN 1 AND 50),
  bio TEXT CHECK (bio IS NULL OR length(bio) <= 250),
  avatar_url TEXT CHECK (avatar_url IS NULL OR (avatar_url ~* '^https://[^\s/$.?#].[^\s]*$' AND length(avatar_url) <= 1000)),
  website_url TEXT CHECK (website_url IS NULL OR (website_url ~* '^https://[^\s/$.?#].[^\s]*$' AND length(website_url) <= 500)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comments on table and columns for documentation
COMMENT ON TABLE public.profiles IS 'Public creator and user profiles. Zero private authentication or privilege data is stored here.';
COMMENT ON COLUMN public.profiles.username IS 'Unique alphanumeric handle between 3 and 30 characters.';
COMMENT ON COLUMN public.profiles.avatar_url IS 'External https:// avatar image link only. Zero internal file uploads or storage buckets.';

-- 2. Collision-safe username generator
CREATE OR REPLACE FUNCTION public.generate_unique_username(base_name TEXT, user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_cleaned TEXT;
  v_candidate TEXT;
  v_iter INT := 0;
  v_exists BOOLEAN;
BEGIN
  -- Sanitize base_name: lowercase, keep a-z 0-9 _, truncate to 20 chars
  v_cleaned := lower(regexp_replace(COALESCE(base_name, ''), '[^a-zA-Z0-9_]', '', 'g'));
  IF length(v_cleaned) < 3 THEN
    v_cleaned := 'user';
  ELSE
    v_cleaned := substr(v_cleaned, 1, 20);
  END IF;

  -- First check if raw base name is free
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE username = v_cleaned) INTO v_exists;
  IF NOT v_exists THEN
    RETURN v_cleaned;
  END IF;

  -- Retry loop up to 5 times with random suffix
  LOOP
    v_iter := v_iter + 1;
    v_candidate := substr(v_cleaned, 1, 23) || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 5);
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE username = v_candidate) INTO v_exists;
    IF NOT v_exists THEN
      RETURN v_candidate;
    END IF;
    EXIT WHEN v_iter >= 5;
  END LOOP;

  -- Deterministic UUID-derived fallback guaranteed to be unique within UUID entropy
  RETURN 'u_' || substr(replace(user_id::text, '-', ''), 1, 28);
END;
$$;

-- 3. Resilient trigger function on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_base_name TEXT;
  v_display_name TEXT;
  v_username TEXT;
BEGIN
  v_base_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'username'), ''),
    split_part(NEW.email, '@', 1),
    'user'
  );

  v_display_name := COALESCE(
    NULLIF(trim(NEW.raw_user_meta_data->>'display_name'), ''),
    split_part(NEW.email, '@', 1),
    'User'
  );
  IF length(v_display_name) > 50 THEN
    v_display_name := substr(v_display_name, 1, 50);
  END IF;

  v_username := public.generate_unique_username(v_base_name, NEW.id);

  BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (NEW.id, v_username, v_display_name);
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user primary insert failed for %: %', NEW.id, SQLERRM;
    BEGIN
      INSERT INTO public.profiles (id, username, display_name)
      VALUES (NEW.id, 'u_' || substr(replace(NEW.id::text, '-', ''), 1, 28), 'User')
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'handle_new_user secondary fallback failed for %: %', NEW.id, SQLERRM;
    END;
  END;

  RETURN NEW;
END;
$$;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Idempotent JIT recovery RPC for missing profiles
CREATE OR REPLACE FUNCTION public.ensure_profile_exists()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id UUID;
  v_profile public.profiles;
  v_fallback_username TEXT;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: No active session';
  END IF;

  -- 1. Check if profile already exists; if found, return unmodified
  SELECT * INTO v_profile FROM public.profiles WHERE id = v_caller_id;
  IF FOUND THEN
    RETURN v_profile;
  END IF;

  -- 2. Synthesize missing profile if row was absent
  v_fallback_username := public.generate_unique_username('user', v_caller_id);

  INSERT INTO public.profiles (id, username, display_name)
  VALUES (v_caller_id, v_fallback_username, 'User')
  ON CONFLICT (id) DO NOTHING
  RETURNING * INTO v_profile;

  IF v_profile.id IS NULL THEN
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_caller_id;
  END IF;

  RETURN v_profile;
END;
$$;

-- 5. Immutable identity protection trigger
CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.id <> OLD.id THEN
    RAISE EXCEPTION 'Profile ID is immutable';
  END IF;
  IF NEW.created_at <> OLD.created_at THEN
    RAISE EXCEPTION 'created_at is immutable';
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_profile_update ON public.profiles;
CREATE TRIGGER before_profile_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_fields();

-- 6. Lock down EXECUTE grants on internal functions
REVOKE ALL ON FUNCTION public.generate_unique_username(TEXT, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.protect_profile_fields() FROM PUBLIC, anon;

REVOKE ALL ON FUNCTION public.ensure_profile_exists() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.ensure_profile_exists() TO authenticated;

-- 7. Enable and define Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
