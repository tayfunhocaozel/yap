import { createContext, useContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth, AuthProvider içinde kullanılmalıdır.');
  }
  return context;
}
