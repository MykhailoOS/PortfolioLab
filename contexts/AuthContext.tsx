import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  jwt: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setJwt(session.access_token);
        setUser({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
          email: session.user.email || '',
        });
      }
      setIsLoading(false);
    };

    restoreSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setJwt(session.access_token);
        setUser({
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
          email: session.user.email || '',
        });
      } else {
        setJwt(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.session) {
      setJwt(data.session.access_token);
      setUser({
        id: data.user.id,
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
        email: data.user.email || '',
      });
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
        },
      },
    });

    if (error) throw error;

    if (data.session) {
      setJwt(data.session.access_token);
      setUser({
        id: data.user.id,
        username: data.user.user_metadata?.username || username || email.split('@')[0],
        email: data.user.email || email,
      });
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setJwt(null);
    setUser(null);
  }, []);

  const value = {
    user,
    jwt,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!jwt,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
