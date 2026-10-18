import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/database.types';

export interface UpdateProfileInput {
  displayName?: string;
  bio?: string | null;
  websiteUrl?: string | null;
  avatarUrl?: string | null;
}

export interface SignUpResult {
  user: User | null;
  session: Session | null;
  needsEmailConfirmation: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  profileError: string | null;
  isPasswordRecovery: boolean;
  setIsPasswordRecovery: (isRecovery: boolean) => void;
  signUpWithEmail: (email: string, password: string, displayName: string, username: string) => Promise<SignUpResult>;
  signInWithEmail: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<Profile>;
  retryProfileRecovery: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(false);

  // Single-attempt guard to prevent infinite re-fetching loops
  const recoveryAttemptedRef = useRef<boolean>(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthContext] Error querying profile:', error);
      }

      if (data) {
        setProfile(data);
        setProfileError(null);
        return;
      }

      // If profile record is missing, perform bounded JIT self-healing
      if (!recoveryAttemptedRef.current) {
        recoveryAttemptedRef.current = true;
        const { data: recovered, error: rpcErr } = await supabase.rpc('ensure_profile_exists');

        if (rpcErr) {
          console.error('[AuthContext] JIT profile recovery RPC failed:', rpcErr);
          setProfileError('Unable to load or initialize your profile. Please refresh or retry.');
        } else if (recovered) {
          setProfile(recovered);
          setProfileError(null);
        }
      } else {
        setProfileError('Profile record not found.');
      }
    } catch (err) {
      console.error('[AuthContext] Unexpected error fetching profile:', err);
      setProfileError('Unexpected error loading profile.');
    }
  }, []);

  const retryProfileRecovery = async () => {
    if (!user) return;
    recoveryAttemptedRef.current = false;
    setProfileError(null);
    await fetchProfile(user.id);
  };

  useEffect(() => {
    let mounted = true;

    // Check for recovery hash in URL (e.g. #access_token=...&type=recovery)
    if (window.location.hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }

    // 1. Initial Session Check
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('[AuthContext] Error getting initial session:', error);
      }
      setSession(initialSession);
      setUser(initialSession?.user ?? null);

      if (initialSession?.user) {
        fetchProfile(initialSession.user.id).finally(() => {
          if (mounted) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (event === 'SIGNED_OUT') {
        setProfile(null);
        setProfileError(null);
        setIsPasswordRecovery(false);
        recoveryAttemptedRef.current = false;
        setIsLoading(false);
        return;
      }

      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id);
      } else {
        setProfile(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    username: string
  ): Promise<SignUpResult> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
          username: username.trim().toLowerCase(),
        },
      },
    });

    if (error) throw error;

    const needsEmailConfirmation = !data.session;
    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation,
    };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { user: data.user, session: data.session };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileError(null);
    setIsPasswordRecovery(false);
    recoveryAttemptedRef.current = false;
  };

  const requestPasswordReset = async (email: string) => {
    const redirectTo = `${window.location.origin}/#type=recovery`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) throw error;
  };

  const updatePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    setIsPasswordRecovery(false);
  };

  const updateProfile = async (input: UpdateProfileInput): Promise<Profile> => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Client-side pre-validations matching DB constraints
    if (input.displayName !== undefined) {
      const trimmed = input.displayName.trim();
      if (trimmed.length < 1 || trimmed.length > 50) {
        throw new Error('Display name must be between 1 and 50 characters.');
      }
    }

    if (input.bio !== undefined && input.bio !== null) {
      if (input.bio.length > 250) {
        throw new Error('Bio cannot exceed 250 characters.');
      }
    }

    if (input.avatarUrl) {
      if (!input.avatarUrl.startsWith('https://')) {
        throw new Error('Avatar URL must be a secure link starting with https://');
      }
      if (input.avatarUrl.length > 1000) {
        throw new Error('Avatar URL is too long (maximum 1000 characters).');
      }
    }

    if (input.websiteUrl) {
      if (!input.websiteUrl.startsWith('https://')) {
        throw new Error('Website URL must start with https://');
      }
      if (input.websiteUrl.length > 500) {
        throw new Error('Website URL is too long (maximum 500 characters).');
      }
    }

    const payload: Partial<Profile> = {};
    if (input.displayName !== undefined) payload.display_name = input.displayName.trim();
    if (input.bio !== undefined) payload.bio = input.bio ? input.bio.trim() : null;
    if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl ? input.avatarUrl.trim() : null;
    if (input.websiteUrl !== undefined) payload.website_url = input.websiteUrl ? input.websiteUrl.trim() : null;

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) throw error;
    setProfile(data);
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        profileError,
        isPasswordRecovery,
        setIsPasswordRecovery,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        requestPasswordReset,
        updatePassword,
        updateProfile,
        retryProfileRecovery,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
