'use client';

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { User } from '@/types';

interface Session {
  user: User | null;
  isLoading: boolean;
  error: any;
  refreshSession: () => void;
}

const SessionContext = createContext<Session | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        setUser(null);
      } else {
        const data = await response.json();
        if (data && data.user && data.user._id) {
            setUser(data.user);
        } else {
            setUser(null);
        }
      }
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const refreshSession = useCallback(() => {
    fetchSession();
  }, [fetchSession]);

  const value = {
    user,
    isLoading,
    error,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = (): Session => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
