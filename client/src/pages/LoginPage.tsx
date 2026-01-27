/**
 * Login page with username/password authentication
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, LogIn } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { user, isLoading, error, login, clearError, initialize, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(username, password);
    } catch {
      // Error is handled in store
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-md border-2 border-border shadow-brutal">
              <BookOpen className="w-10 h-10" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black">Ficcionarios</CardTitle>
          <CardDescription className="text-lg">
            Sign in to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                minLength={3}
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-medium rounded-md">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
