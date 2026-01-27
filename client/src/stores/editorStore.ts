/**
 * Editor store for ficcionario editing state
 */
import { create } from 'zustand';
import { api, type FiccionarioWithFicheros, type Story } from '../services/api';

export type SaveStatus = 'idle' | 'unsaved' | 'saving' | 'saved' | 'error';

interface EditorState {
  ficcionario: FiccionarioWithFicheros | null;
  originalFiccionario: FiccionarioWithFicheros | null;
  isLoading: boolean;
  error: string | null;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;

  // Validation
  duplicateFicheroError: string | null;

  // Stories for selection
  stories: Story[];
  storiesLoading: boolean;

  // Actions
  loadFiccionario: (id: number) => Promise<void>;
  updateField: <K extends keyof FiccionarioWithFicheros>(
    field: K,
    value: FiccionarioWithFicheros[K]
  ) => void;
  saveChanges: () => Promise<boolean>;
  deleteFiccionario: () => Promise<void>;

  // Fichero actions
  addFichero: () => Promise<void>;
  updateFicheroLocal: (id: number, data: { storyId?: number; terms?: string[] }) => void;
  saveFichero: (id: number) => Promise<void>;
  deleteFichero: (id: number) => Promise<void>;

  // Story actions
  loadStories: (search?: string) => Promise<void>;
  createStory: (title: string, content: string) => Promise<{ isDuplicate: boolean; story: Story }>;

  // Validation
  validateDuplicateFicheros: () => boolean;

  // Generation
  generateMobi: () => Promise<Blob>;

  // Cleanup
  reset: () => void;
}

// Helper to check if fichero data matches
function ficheroSignature(fichero: { storyId: number | null; terms: { word: string }[] }): string {
  const termWords = fichero.terms.map(t => t.word).sort().join(',');
  return `${fichero.storyId || 'null'}:${termWords}`;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  ficcionario: null,
  originalFiccionario: null,
  isLoading: false,
  error: null,
  saveStatus: 'idle',
  lastSaved: null,
  isDirty: false,
  duplicateFicheroError: null,
  stories: [],
  storiesLoading: false,

  loadFiccionario: async (id: number) => {
    set({ isLoading: true, error: null, isDirty: false, saveStatus: 'idle' });
    try {
      const { ficcionario } = await api.getFiccionario(id);
      set({
        ficcionario,
        originalFiccionario: JSON.parse(JSON.stringify(ficcionario)),
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load',
      });
      throw err;
    }
  },

  updateField: (field, value) => {
    const { ficcionario } = get();
    if (!ficcionario) return;

    set({
      ficcionario: { ...ficcionario, [field]: value },
      isDirty: true,
      saveStatus: 'unsaved',
    });
  },

  saveChanges: async () => {
    const { ficcionario, validateDuplicateFicheros } = get();
    if (!ficcionario) return false;

    // Validate before saving
    if (!validateDuplicateFicheros()) {
      return false;
    }

    set({ saveStatus: 'saving', error: null });

    try {
      // Save ficcionario general info
      await api.updateFiccionario(ficcionario.id, {
        title: ficcionario.title,
        version: ficcionario.version,
        authors: ficcionario.authors || undefined,
        inLanguage: ficcionario.inLanguage,
        outLanguage: ficcionario.outLanguage,
        outputName: ficcionario.outputName || undefined,
        copyright: ficcionario.copyright || undefined,
      });

      // Save each fichero
      for (const fichero of ficcionario.ficheros) {
        await api.updateFichero(fichero.id, {
          storyId: fichero.storyId || undefined,
          terms: fichero.terms.map(t => t.word),
        });
      }

      // Reload to get fresh data
      const { ficcionario: updated } = await api.getFiccionario(ficcionario.id);

      set({
        ficcionario: updated,
        originalFiccionario: JSON.parse(JSON.stringify(updated)),
        saveStatus: 'saved',
        lastSaved: new Date(),
        isDirty: false,
      });

      // Reset status after delay
      setTimeout(() => {
        const { saveStatus } = get();
        if (saveStatus === 'saved') {
          set({ saveStatus: 'idle' });
        }
      }, 2000);

      return true;
    } catch (err) {
      set({
        saveStatus: 'error',
        error: err instanceof Error ? err.message : 'Failed to save',
      });
      return false;
    }
  },

  deleteFiccionario: async () => {
    const { ficcionario } = get();
    if (!ficcionario) return;

    await api.deleteFiccionario(ficcionario.id);
  },

  addFichero: async () => {
    const { ficcionario } = get();
    if (!ficcionario) return;

    try {
      const { fichero } = await api.createFichero(ficcionario.id);
      set({
        ficcionario: {
          ...ficcionario,
          ficheros: [...ficcionario.ficheros, fichero],
        },
        isDirty: true,
        saveStatus: 'unsaved',
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add fichero' });
    }
  },

  updateFicheroLocal: (id, data) => {
    const { ficcionario, validateDuplicateFicheros } = get();
    if (!ficcionario) return;

    const updatedFicheros = ficcionario.ficheros.map((f) => {
      if (f.id !== id) return f;

      const updatedFichero = { ...f };
      if (data.storyId !== undefined) {
        updatedFichero.storyId = data.storyId;
        // Find the story object
        const story = get().stories.find(s => s.id === data.storyId);
        updatedFichero.story = story || null;
      }
      if (data.terms !== undefined) {
        updatedFichero.terms = data.terms.map((word, index) => ({
          id: -(index + 1), // Temporary negative IDs for new terms
          ficheroId: id,
          word,
        }));
      }
      return updatedFichero;
    });

    set({
      ficcionario: {
        ...ficcionario,
        ficheros: updatedFicheros,
      },
      isDirty: true,
      saveStatus: 'unsaved',
    });

    // Validate after update
    setTimeout(() => validateDuplicateFicheros(), 0);
  },

  saveFichero: async (id) => {
    const { ficcionario } = get();
    if (!ficcionario) return;

    const fichero = ficcionario.ficheros.find(f => f.id === id);
    if (!fichero) return;

    try {
      const { fichero: updated } = await api.updateFichero(id, {
        storyId: fichero.storyId || undefined,
        terms: fichero.terms.map(t => t.word),
      });

      set({
        ficcionario: {
          ...ficcionario,
          ficheros: ficcionario.ficheros.map(f => f.id === id ? updated : f),
        },
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to save fichero' });
    }
  },

  deleteFichero: async (id) => {
    const { ficcionario } = get();
    if (!ficcionario) return;

    try {
      await api.deleteFichero(id);
      set({
        ficcionario: {
          ...ficcionario,
          ficheros: ficcionario.ficheros.filter((f) => f.id !== id),
        },
        isDirty: true,
        saveStatus: 'unsaved',
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete fichero' });
    }
  },

  loadStories: async (search?: string) => {
    set({ storiesLoading: true });
    try {
      const { stories } = await api.getStories(search);
      set({ stories, storiesLoading: false });
    } catch {
      set({ storiesLoading: false });
    }
  },

  createStory: async (title: string, content: string) => {
    const result = await api.createStory({ title, content });

    // Refresh stories list
    const { stories } = await api.getStories();
    set({ stories });

    return result;
  },

  validateDuplicateFicheros: () => {
    const { ficcionario } = get();
    if (!ficcionario) return true;

    const signatures = new Map<string, number>();

    for (const fichero of ficcionario.ficheros) {
      // Only validate if fichero has both terms and story
      if (fichero.terms.length === 0 || !fichero.storyId) continue;

      const sig = ficheroSignature(fichero);
      const existingId = signatures.get(sig);

      if (existingId !== undefined) {
        set({
          duplicateFicheroError: `Ficheros have duplicate terms and story combination`,
        });
        return false;
      }

      signatures.set(sig, fichero.id);
    }

    set({ duplicateFicheroError: null });
    return true;
  },

  generateMobi: async () => {
    const { ficcionario } = get();
    if (!ficcionario) throw new Error('No ficcionario loaded');

    return api.generateMobi(ficcionario.id);
  },

  reset: () => {
    set({
      ficcionario: null,
      originalFiccionario: null,
      isLoading: false,
      error: null,
      saveStatus: 'idle',
      lastSaved: null,
      isDirty: false,
      duplicateFicheroError: null,
    });
  },
}));
