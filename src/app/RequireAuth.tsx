import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './authContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return null;
  if (!session) return <Navigate to="/giris" replace />;

  return <>{children}</>;
}
