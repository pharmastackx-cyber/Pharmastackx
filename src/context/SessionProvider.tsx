
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
    isLoading: true, // Start with loading true
    error: null,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        console.log('Attempting to fetch session...');
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          console.log('Fetch response not OK. User is likely not authenticated.');
          // It's not an error if the user is not logged in.
          setSession({ user: null, isLoading: false, error: null });
          return;
        }

        const data = await response.json();
        console.log('Session data received:', data);
        
        if (data && data.user && data.user._id) {
            console.log('User session set:', data.user);
            setSession({ user: data.user, isLoading: false, error: null });
        } else {
            console.log('No user data in response.');
            setSession({ user: null, isLoading: false, error: null });
        }

      } catch (error) {
        console.error('Session fetch error:', error);
        // Only set an error if the fetch itself fails
        setSession({ user: null, isLoading: false, error });
      }
    };

    fetchSession();
    
  }, []); // Empty dependency array ensures this runs only once on mount

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
