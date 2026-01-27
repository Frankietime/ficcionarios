/**
 * Dashboard page showing list of ficcionarios
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, Trash2, Pencil, Download, Copy } from 'lucide-react';
import { api, type Ficcionario } from '../services/api';
import { useUiStore } from '../stores/uiStore';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Tooltip, TooltipCard } from '../components/ui/tooltip';

function EmptyState({ onCreateNew }: { onCreateNew: () => void }) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="flex justify-center mb-4">
          <div className="p-6 bg-muted rounded-full border-2 border-border">
            <FileText className="w-12 h-12 text-muted-foreground" />
          </div>
        </div>
        <h3 className="text-xl font-bold mb-2">No ficcionarios yet</h3>
        <p className="text-muted-foreground mb-6">
          Create your first ficcionario to start building custom Kindle dictionaries.
        </p>
        <Button onClick={onCreateNew} size="lg">
          <Plus className="w-5 h-5 mr-2" />
          Create Ficcionario
        </Button>
      </CardContent>
    </Card>
  );
}

function DashboardTable({
  ficcionarios,
  onSelect,
  onClone,
  onDelete,
  onGenerate,
}: {
  ficcionarios: Ficcionario[];
  onSelect: (id: number) => void;
  onClone: (id: number) => void;
  onDelete: (id: number, title: string) => void;
  onGenerate: (id: number) => void;
}) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
    return { dateStr, timeStr };
  };

  return (
    <div className="border-2 border-border rounded-md overflow-hidden shadow-brutal-md">
      <table className="w-full">
        <thead className="bg-primary text-primary-foreground">
          <tr>
            <th className="text-left px-4 py-3 font-bold">Title</th>
            <th className="text-left px-4 py-3 font-bold hidden md:table-cell">Cuentos</th>
            <th className="text-left px-4 py-3 font-bold hidden lg:table-cell">Created By</th>
            <th className="text-left px-4 py-3 font-bold hidden sm:table-cell">Updated</th>
            <th className="px-4 py-3 font-bold w-36">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y-2 divide-border">
          {ficcionarios.map((f) => {
            const { dateStr, timeStr } = formatDateTime(f.updatedAt);
            return (
              <tr
                key={f.id}
                className="hover:bg-muted/50 transition-colors bg-card"
              >
                <td className="px-4 py-3">
                  <div className="font-bold">{f.title}</div>
                  <div className="text-sm text-muted-foreground md:hidden">
                    {f.storyCount} cuentos
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {f.storyCount > 0 ? (
                    <Tooltip
                      content={
                        <TooltipCard
                          header="CUENTOS INCLUIDOS"
                          items={f.storyTitles}
                        />
                      }
                    >
                      <span className="underline cursor-help font-medium">
                        {f.storyCount} {f.storyCount === 1 ? 'cuento' : 'cuentos'}
                      </span>
                    </Tooltip>
                  ) : (
                    <span className="text-muted-foreground">0 cuentos</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {f.createdBy?.username || '-'}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <div>
                    <div className="font-medium">{dateStr}</div>
                    <div className="text-sm text-muted-foreground">{timeStr}</div>
                    {f.updatedBy && (
                      <div className="text-xs text-muted-foreground mt-1">
                        by {f.updatedBy.username}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="[&_svg]:size-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(f.id);
                      }}
                      title="Edit"
                    >
                      <Pencil />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="[&_svg]:size-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClone(f.id);
                      }}
                      title="Clone"
                    >
                      <Copy />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="[&_svg]:size-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onGenerate(f.id);
                      }}
                      title="Generate .mobi"
                    >
                      <Download />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 [&_svg]:size-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(f.id, f.title);
                      }}
                      title="Delete"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function DashboardPage() {
  const [ficcionarios, setFiccionarios] = useState<Ficcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const navigate = useNavigate();
  const { openDeleteConfirm, closeDeleteConfirm, addToast } = useUiStore();

  const loadFiccionarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { ficcionarios } = await api.getFiccionarios();
      setFiccionarios(ficcionarios);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiccionarios();
  }, []);

  const handleCreateNew = async () => {
    try {
      const { ficcionario } = await api.createFiccionario({
        title: 'Untitled Ficcionario',
      });
      navigate(`/ficcionario/${ficcionario.id}`);
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to create');
    }
  };

  const handleSelect = (id: number) => {
    navigate(`/ficcionario/${id}`);
  };

  const handleClone = async (id: number) => {
    try {
      const { ficcionario } = await api.cloneFiccionario(id);
      addToast('success', `Cloned as "${ficcionario.title}"`);
      await loadFiccionarios();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to clone');
    }
  };

  const handleDelete = (id: number, title: string) => {
    openDeleteConfirm(
      'Delete Ficcionario',
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
      async () => {
        try {
          await api.deleteFiccionario(id);
          setFiccionarios((prev) => prev.filter((f) => f.id !== id));
          addToast('success', 'Ficcionario deleted');
          closeDeleteConfirm();
        } catch (err) {
          addToast('error', err instanceof Error ? err.message : 'Failed to delete');
        }
      }
    );
  };

  const handleGenerate = async (id: number) => {
    const ficcionario = ficcionarios.find((f) => f.id === id);
    if (!ficcionario) return;

    setIsGenerating(true);
    try {
      const blob = await api.generateMobi(id);

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ficcionario.outputName || 'dictionary'}.mobi`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      addToast('success', 'Dictionary generated successfully!');
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-border border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-destructive font-medium mb-4">{error}</p>
          <Button onClick={loadFiccionarios}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your ficcionarios and create new ones
          </p>
        </div>

        {ficcionarios.length > 0 && (
          <Button onClick={handleCreateNew}>
            <Plus className="w-5 h-5 mr-2" />
            New Ficcionario
          </Button>
        )}
      </div>

      {isGenerating && (
        <div className="fixed inset-0 bg-overlay/50 flex items-center justify-center z-50">
          <Card className="p-6 text-center">
            <div className="w-8 h-8 border-4 border-border border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-medium">Generating dictionary...</p>
          </Card>
        </div>
      )}

      {ficcionarios.length === 0 ? (
        <EmptyState onCreateNew={handleCreateNew} />
      ) : (
        <DashboardTable
          ficcionarios={ficcionarios}
          onSelect={handleSelect}
          onClone={handleClone}
          onDelete={handleDelete}
          onGenerate={handleGenerate}
        />
      )}
    </div>
  );
}
