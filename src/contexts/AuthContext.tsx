
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isGuest: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Clear guest mode when user successfully signs in
        if (session?.user) {
          setIsGuest(false);
          localStorage.removeItem('guest_mode');
          console.log('User authenticated, clearing guest mode');
        } else if (event === 'SIGNED_OUT') {
          // Only set guest mode if explicitly signed out and guest mode was previously set
          const wasGuest = localStorage.getItem('guest_mode') === 'true';
          setIsGuest(wasGuest);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // If we have a valid session, clear any guest mode
        setSession(session);
        setUser(session?.user);
        setIsGuest(false);
        localStorage.removeItem('guest_mode');
        console.log('Existing session found, clearing guest mode');
      } else {
        // Only check for guest mode if no valid session
        const guestMode = localStorage.getItem('guest_mode');
        if (guestMode === 'true') {
          setIsGuest(true);
          console.log('No session, setting guest mode');
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // Clear guest mode immediately on successful sign in
    if (!error) {
      setIsGuest(false);
      localStorage.removeItem('guest_mode');
      console.log('Sign in successful, clearing guest mode');
    }
    
    return { error };
  };

  const signOut = async () => {
    setIsGuest(false);
    localStorage.removeItem('guest_mode');
    await supabase.auth.signOut();
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setLoading(false);
    localStorage.setItem('guest_mode', 'true');
    console.log('Continuing as guest');
  };

  const value = {
    user,
    session,
    loading,
    isGuest,
    signUp,
    signIn,
    signOut,
    continueAsGuest
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
