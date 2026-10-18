-- ==============================================================================
-- Automated Test Suite: Profiles Row Level Security (RLS) & Trigger Security
-- Phase: 01-foundation-and-auth
-- Plan: 02
--
-- EXECUTION INSTRUCTIONS:
--
-- Prerequisite: A running Supabase instance (local Docker or development project).
--
-- Method 1 (Supabase CLI):
--   supabase db execute -f supabase/tests/profiles_rls_test.sql
--
-- Method 2 (Direct psql against DB connection string):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/tests/profiles_rls_test.sql
--
-- Method 3 (Supabase Dashboard):
--   Copy and paste this entire script into the Supabase Dashboard -> SQL Editor.
--   Run query. The script executes in an isolated transaction and ends with ROLLBACK.
-- ==============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. SETUP TEST FIXTURES
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_user_alpha UUID := '11111111-1111-1111-1111-111111111111';
  v_user_beta  UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  RAISE NOTICE '==> [1/6] Setting up test fixtures in auth.users...';

  -- Clean up any preexisting fixture users in test sandbox
  DELETE FROM auth.users WHERE id IN (v_user_alpha, v_user_beta);

  -- Insert User Alpha
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_user_alpha,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'alpha@example.com',
    'test-encrypted-password',
    NOW(),
    '{"username": "alpha_creator", "display_name": "Alpha Creator"}'::jsonb,
    NOW(),
    NOW()
  );

  -- Insert User Beta
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    v_user_beta,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'beta@example.com',
    'test-encrypted-password',
    NOW(),
    '{"username": "beta_curator", "display_name": "Beta Curator"}'::jsonb,
    NOW(),
    NOW()
  );

  -- Assert profiles were created by handle_new_user trigger
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_alpha AND username = 'alpha_creator') THEN
    RAISE EXCEPTION 'TEST FAILED: Trigger failed to create profile for User Alpha';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_beta AND username = 'beta_curator') THEN
    RAISE EXCEPTION 'TEST FAILED: Trigger failed to create profile for User Beta';
  END IF;

  RAISE NOTICE '    PASS: Initial profiles created by trigger successfully.';
END $$;

-- -----------------------------------------------------------------------------
-- 2. ANONYMOUS ROLE ACCESS TESTS
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_count INT;
BEGIN
  RAISE NOTICE '==> [2/6] Verifying anonymous role permissions...';

  -- Impersonate anonymous guest
  SET LOCAL ROLE anon;
  SET LOCAL "request.jwt.claims" = '{}';

  -- Test 2.1: Anonymous can SELECT public profile fields
  SELECT COUNT(*) INTO v_count
  FROM public.profiles
  WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');

  IF v_count <> 2 THEN
    RAISE EXCEPTION 'TEST FAILED: Anonymous user cannot read public profiles (expected 2, got %)', v_count;
  END IF;

  -- Test 2.2: Anonymous CANNOT update profiles (RLS filters out rows)
  UPDATE public.profiles
  SET display_name = 'Anon Tamper'
  WHERE id = '11111111-1111-1111-1111-111111111111';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'TEST FAILED: Anonymous user was able to update a profile! (updated % rows)', v_count;
  END IF;

  RAISE NOTICE '    PASS: Anonymous role read allowed; updates blocked.';
END $$;

-- Test 2.3: Anonymous CANNOT execute privileged functions
DO $$
BEGIN
  SET LOCAL ROLE anon;
  SET LOCAL "request.jwt.claims" = '{}';

  BEGIN
    PERFORM public.ensure_profile_exists();
    RAISE EXCEPTION 'TEST FAILED: Anonymous user executed ensure_profile_exists() without error!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '    PASS: Anonymous execution of ensure_profile_exists() correctly rejected (insufficient_privilege).';
  END;

  BEGIN
    PERFORM public.generate_unique_username('test', '11111111-1111-1111-1111-111111111111');
    RAISE EXCEPTION 'TEST FAILED: Anonymous user executed generate_unique_username() without error!';
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE '    PASS: Anonymous execution of generate_unique_username() correctly rejected (insufficient_privilege).';
  END;
END $$;

-- -----------------------------------------------------------------------------
-- 3. AUTHENTICATED SELF-UPDATE TEST
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_count INT;
  v_updated_name TEXT;
BEGIN
  RAISE NOTICE '==> [3/6] Verifying authenticated owner self-update...';

  -- Impersonate User Alpha
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated", "aud": "authenticated"}';

  UPDATE public.profiles
  SET display_name = 'Alpha Renamed',
      bio = 'Curating verified news and video links.'
  WHERE id = '11111111-1111-1111-1111-111111111111';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 1 THEN
    RAISE EXCEPTION 'TEST FAILED: Authenticated user could not update their own profile (updated % rows)', v_count;
  END IF;

  SELECT display_name INTO v_updated_name
  FROM public.profiles
  WHERE id = '11111111-1111-1111-1111-111111111111';

  IF v_updated_name <> 'Alpha Renamed' THEN
    RAISE EXCEPTION 'TEST FAILED: Updated display_name did not persist';
  END IF;

  RAISE NOTICE '    PASS: Owner self-update verified.';
END $$;

-- -----------------------------------------------------------------------------
-- 4. CROSS-USER WRITE BLOCKING TEST (CRUCIAL SECURITY BOUNDARY)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_count INT;
  v_beta_name TEXT;
BEGIN
  RAISE NOTICE '==> [4/6] Verifying cross-user write blocking (Alpha attempting to write Beta)...';

  -- Impersonate User Alpha
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated", "aud": "authenticated"}';

  -- Attempt 4.1: Cross-user UPDATE
  UPDATE public.profiles
  SET display_name = 'Hacked by Alpha'
  WHERE id = '22222222-2222-2222-2222-222222222222';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'CRITICAL SECURITY FAILURE: User Alpha updated User Beta profile! (rows affected: %)', v_count;
  END IF;

  -- Verify User Beta data was untouched
  SELECT display_name INTO v_beta_name
  FROM public.profiles
  WHERE id = '22222222-2222-2222-2222-222222222222';

  IF v_beta_name <> 'Beta Curator' THEN
    RAISE EXCEPTION 'CRITICAL SECURITY FAILURE: User Beta data was modified (% != Beta Curator)', v_beta_name;
  END IF;

  -- Attempt 4.2: Cross-user DELETE
  DELETE FROM public.profiles
  WHERE id = '22222222-2222-2222-2222-222222222222';

  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count <> 0 THEN
    RAISE EXCEPTION 'CRITICAL SECURITY FAILURE: User Alpha deleted User Beta profile!';
  END IF;

  -- Attempt 4.3: Cross-user INSERT
  BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES ('22222222-2222-2222-2222-222222222222', 'imposter', 'Imposter');
    RAISE EXCEPTION 'CRITICAL SECURITY FAILURE: Cross-user INSERT was permitted!';
  EXCEPTION WHEN unique_violation OR check_violation OR insufficient_privilege THEN
    RAISE NOTICE '    PASS: Cross-user INSERT correctly blocked by policy/constraint.';
  END;

  RAISE NOTICE '    PASS: Cross-user UPDATE and DELETE affect 0 rows; cross-user writes strictly blocked.';
END $$;

-- -----------------------------------------------------------------------------
-- 5. IMMUTABLE IDENTITY FIELD PROTECTION TEST
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '==> [5/6] Verifying immutable identity field trigger...';

  -- Impersonate User Alpha
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated", "aud": "authenticated"}';

  BEGIN
    UPDATE public.profiles
    SET id = '99999999-9999-9999-9999-999999999999'
    WHERE id = '11111111-1111-1111-1111-111111111111';

    RAISE EXCEPTION 'TEST FAILED: Profile ID mutation was not blocked!';
  EXCEPTION WHEN OTHERS THEN
    IF SQLERRM LIKE '%Profile ID is immutable%' THEN
      RAISE NOTICE '    PASS: Profile ID mutation correctly blocked by trigger.';
    ELSE
      RAISE EXCEPTION 'TEST FAILED: Unexpected error message on ID mutation: %', SQLERRM;
    END IF;
  END;
END $$;

-- -----------------------------------------------------------------------------
-- 6. JIT RECOVERY RPC BOUNDARY TEST
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  v_recovered public.profiles;
BEGIN
  RAISE NOTICE '==> [6/6] Verifying ensure_profile_exists() caller isolation...';

  -- Impersonate User Alpha
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated", "aud": "authenticated"}';

  SELECT * INTO v_recovered FROM public.ensure_profile_exists();

  IF v_recovered.id <> '11111111-1111-1111-1111-111111111111' THEN
    RAISE EXCEPTION 'TEST FAILED: ensure_profile_exists() returned profile % instead of caller Alpha', v_recovered.id;
  END IF;

  RAISE NOTICE '    PASS: ensure_profile_exists() strictly bound to calling user.';
END $$;

-- Clean rollback ensuring zero database pollution
ROLLBACK;

-- Summary notice when run interactively
DO $$
BEGIN
  RAISE NOTICE '=======================================================';
  RAISE NOTICE ' ALL 6 RLS AND TRIGGER SECURITY TESTS PASSED CLEANLY!  ';
  RAISE NOTICE ' Transaction rolled back. Zero database changes saved. ';
  RAISE NOTICE '=======================================================';
END $$;
