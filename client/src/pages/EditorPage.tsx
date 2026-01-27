/**
 * Editor page for creating/editing ficcionarios
 */
import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Plus, Save, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useEditorStore, type SaveStatus } from '../stores/editorStore';
import { useUiStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { GeneralInfoForm } from '../components/editor/GeneralInfoForm';
import { FicherosSection } from '../components/editor/FicherosSection';


function SaveStatusBadge({ status }: { status: SaveStatus }) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-sm text-muted-foreground px-3 py-1 bg-muted rounded-md border-2 border-border">
        <Loader2 className="w-4 h-4 animate-spin" />
        Saving...
      </span>
    );
  }

  if (status === 'saved') {
    return (
      <span className="flex items-center gap-1 text-sm text-green-700 px-3 py-1 bg-green-100 rounded-md border-2 border-green-500">
        <Check className="w-4 h-4" />
        Saved
      </span>
    );
  }

  if (status === 'error') {
    return (
      <span className="flex items-center gap-1 text-sm text-red-700 px-3 py-1 bg-red-100 rounded-md border-2 border-red-500">
        <AlertCircle className="w-4 h-4" />
        Error saving
      </span>
    );
  }

  return null;
}

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  const {
    ficcionario,
    isLoading,
    error,
    saveStatus,
    isDirty,
    duplicateFicheroError,
    loadFiccionario,
    updateField,
    saveChanges,
    deleteFiccionario,
    addFichero,
    generateMobi,
    reset,
    loadStories,
  } = useEditorStore();

  const {
    openDeleteConfirm,
    closeDeleteConfirm,
    openGenerateProgress,
    setGenerateStatus,
    closeGenerateProgress,
    addToast,
  } = useUiStore();

  useEffect(() => {
    if (id) {
      loadFiccionario(parseInt(id, 10));
      loadStories();
    }
    return () => reset();
  }, [id, loadFiccionario, loadStories, reset]);

  // Keyboard shortcuts
  const handleSave = useCallback(async () => {
    const state = useEditorStore.getState();
    if (!state.isDirty || state.duplicateFicheroError || state.saveStatus === 'saving') return;
    const success = await state.saveChanges();
    if (success) {
      useUiStore.getState().addToast('success', 'Changes saved successfully');
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+S / Cmd+S = Save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      // "+" = Add Entrada (only when not in input/textarea)
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === '+' && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        addFichero();
      }
      // Tab outside General Info → focus Title
      if (e.key === 'Tab') {
        const inGeneralInfo = (e.target as HTMLElement).closest('[data-general-info]');
        if (!inGeneralInfo) {
          e.preventDefault();
          const titleInput = document.getElementById('title');
          titleInput?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave, addFichero]);

  // Auto-fill authors with current username
  useEffect(() => {
    if (ficcionario && user && !ficcionario.authors?.includes(user.username)) {
      const currentAuthors = ficcionario.authors?.trim();
      const newAuthors = currentAuthors
        ? `${currentAuthors}, ${user.username}`
        : user.username;
      updateField('authors', newAuthors);
    }
  }, [ficcionario?.id, user]); // Only run when ficcionario loads

  const handleBack = () => {
    if (isDirty) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    navigate('/dashboard');
  };

  const handleDelete = () => {
    openDeleteConfirm(
      'Delete Ficcionario',
      `Are you sure you want to delete "${ficcionario?.title}"? This action cannot be undone.`,
      async () => {
        try {
          await deleteFiccionario();
          addToast('success', 'Ficcionario deleted');
          closeDeleteConfirm();
          navigate('/dashboard');
        } catch (err) {
          addToast('error', err instanceof Error ? err.message : 'Failed to delete');
        }
      }
    );
  };

  const handleAddFichero = async () => {
    await addFichero();
  };

  const handleGenerate = async () => {
    // Save first if dirty
    if (isDirty) {
      const saved = await saveChanges();
      if (!saved) {
        addToast('error', 'Please fix errors before generating');
        return;
      }
    }

    openGenerateProgress();

    try {
      const blob = await generateMobi();

      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${ficcionario?.outputName || 'dictionary'}.mobi`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setGenerateStatus('success');
      addToast('success', 'Dictionary generated successfully!');

      setTimeout(() => {
        closeGenerateProgress();
      }, 2000);
    } catch (err) {
      setGenerateStatus('error', err instanceof Error ? err.message : 'Generation failed');
      addToast('error', err instanceof Error ? err.message : 'Generation failed');
    }
  };

  // Validation for generate button
  const canGenerate = () => {
    if (!ficcionario) return false;
    if (!ficcionario.title?.trim()) return false;
    if (!ficcionario.authors?.trim()) return false;
    if (!ficcionario.outputName?.trim()) return false;

    // Need at least one complete fichero (with terms and story)
    const completeFicheros = ficcionario.ficheros.filter(
      (f) => f.story && f.terms.length > 0
    );
    return completeFicheros.length > 0;
  };

  // Validation for save button
  const canSave = () => {
    if (!isDirty) return false;
    if (duplicateFicheroError) return false;
    if (saveStatus === 'saving') return false;
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-border border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !ficcionario) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium mb-4">{error}</p>
        <Button onClick={handleBack}>Back to Dashboard</Button>
      </div>
    );
  }

  if (!ficcionario) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="lg" onClick={handleBack} className="gap-2 text-base">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Button>
          <SaveStatusBadge status={saveStatus} />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={!canSave()}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate()}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Generate .mobi
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleDelete}
            title="Delete Ficcionario"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Duplicate Error */}
      {duplicateFicheroError && (
        <div className="p-4 bg-red-100 border-2 border-red-500 rounded-md text-red-700 font-medium flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {duplicateFicheroError}
        </div>
      )}

      {/* General Info */}
      <GeneralInfoForm />

      {/* Fichero */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Fichero</CardTitle>
              <p className="text-sm text-muted-foreground">
                Each entrada links terms to a story definition
              </p>
            </div>
            <Button variant="outline" onClick={handleAddFichero} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Entrada
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FicherosSection />
        </CardContent>
      </Card>
    </div>
  );
}
