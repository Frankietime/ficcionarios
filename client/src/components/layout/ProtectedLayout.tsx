/**
 * Protected layout wrapper - redirects to login if not authenticated
 */
import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Header } from './Header';

export function ProtectedLayout() {
  const { user, isInitialized, isLoading, initialize } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login', { replace: true });
    }
  }, [isInitialized, user, navigate]);

  // Show loading state while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-lg font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
