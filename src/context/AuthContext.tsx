/**
 * Authentication Context
 * Manages Supabase Auth session, user profile, clinic info, and trial status.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import * as db from '../lib/supabaseDb';
import type { User } from '../types';
import type { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  clinicId: string | null;
  clinicName: string;
  trialStatus: db.TrialStatus | null;
  isAuthLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshTrialStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinicName, setClinicName] = useState<string>('');
  const [trialStatus, setTrialStatus] = useState<db.TrialStatus | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadUserProfile = useCallback(async () => {
    try {
      const profile = await db.getUserProfile();
      if (profile) {
        setUser(profile.user);
        setClinicId(profile.clinic.id);
        setClinicName(profile.clinic.name);
        setTrialStatus(profile.trial);
      } else {
        setUser(null);
        setClinicId(null);
        setClinicName('');
        setTrialStatus(null);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setUser(null);
    }
  }, []);

  const refreshTrialStatus = useCallback(async () => {
    if (clinicId) {
      const status = await db.checkTrialStatus(clinicId);
      setTrialStatus(status);
    }
  }, [clinicId]);

  // Listen to auth state changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession) {
        loadUserProfile().finally(() => setIsAuthLoading(false));
      } else {
        setIsAuthLoading(false);
      }
    });

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession) {
          await loadUserProfile();
        } else {
          setUser(null);
          setClinicId(null);
          setClinicName('');
          setTrialStatus(null);
        }
        setIsAuthLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsAuthLoading(false);
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email hoặc mật khẩu không đúng.' };
      }
      return { error: error.message };
    }
    await loadUserProfile();
    setIsAuthLoading(false);
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setClinicId(null);
    setClinicName('');
    setTrialStatus(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        clinicId,
        clinicName,
        trialStatus,
        isAuthLoading,
        signIn,
        signOut,
        refreshTrialStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
