/**
 * Application header with navigation and user info
 */
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Check, AlertCircle, Loader2 } from 'lucide-react';
import Star8 from '../stars/s8';
import { useAuthStore } from '../../stores/authStore';
import { useEditorStore, type SaveStatus } from '../../stores/editorStore';
import { Button } from '../ui/button';
import { ThemeToggle } from '../ThemeToggle';
import { ColorThemePicker } from '../ColorThemePicker';

function SaveStatusIndicator({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return (
        <span className="flex items-center gap-1 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </span>
      );
    case 'saved':
      return (
        <span className="flex items-center gap-1 text-sm text-green-600">
          <Check className="w-4 h-4" />
          Saved
        </span>
      );
    case 'error':
      return (
        <span className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          Error saving
        </span>
      );
    default:
      return null;
  }
}

export function Header() {
  const { user, logout } = useAuthStore();
  const { ficcionario, saveStatus } = useEditorStore();
  const location = useLocation();
  const navigate = useNavigate();

  const isEditorPage = location.pathname.startsWith('/ficcionario');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b-4 border-black">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Nav */}
          <div className="flex items-center gap-6">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 font-black text-xl hover:opacity-80 transition-opacity"
            >
              <Star8 size={24} />
              Ficcionarios
            </Link>

            {isEditorPage && ficcionario && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="font-bold truncate max-w-[200px]">
                  {ficcionario.title || 'Untitled'}
                </span>
                <SaveStatusIndicator status={saveStatus} />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <ColorThemePicker />
            <ThemeToggle />

            {user && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium hidden sm:block">
                  {user.username}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
