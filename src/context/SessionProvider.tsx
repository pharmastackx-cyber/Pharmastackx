'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User } from '@/types';

interface Session {
  user: User | null;
  isLoading: boolean;
  error: any;
}

const SessionContext = createContext<Session | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          setSession({ user: null, isLoading: false, error: null });
          return;
        }

        const data = await response.json();
        
        if (data && data.user && data.user._id) {
            setSession({ user: data.user, isLoading: false, error: null });
        } else {
            setSession({ user: null, isLoading: false, error: null });
        }

      } catch (error) {
        console.error('Session fetch error:', error);
        setSession({ user: null, isLoading: false, error });
      }
    };

    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={session}>
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
