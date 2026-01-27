/**
 * UI state store for modals, toasts, and UI interactions
 */
import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UiState {
  // Modals
  deleteConfirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: (() => void) | null;
  };
  storyUploadModal: {
    isOpen: boolean;
    onSelect?: (storyId: number) => void;
  };
  generateProgressModal: {
    isOpen: boolean;
    status: 'idle' | 'generating' | 'success' | 'error';
    error?: string;
  };

  // Toasts
  toasts: Toast[];

  // Accordion state
  expandedFicheros: Set<number>;

  // Actions
  openDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
  closeDeleteConfirm: () => void;

  openStoryUpload: (onSelect?: (storyId: number) => void) => void;
  closeStoryUpload: () => void;

  openGenerateProgress: () => void;
  setGenerateStatus: (status: 'idle' | 'generating' | 'success' | 'error', error?: string) => void;
  closeGenerateProgress: () => void;

  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;

  toggleFichero: (id: number) => void;
  expandFichero: (id: number) => void;
  collapseFichero: (id: number) => void;
  expandAllFicheros: (ids: number[]) => void;
  collapseAllFicheros: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  deleteConfirmModal: {
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  },
  storyUploadModal: {
    isOpen: false,
  },
  generateProgressModal: {
    isOpen: false,
    status: 'idle',
  },
  toasts: [],
  expandedFicheros: new Set(),

  openDeleteConfirm: (title, message, onConfirm) => {
    set({
      deleteConfirmModal: { isOpen: true, title, message, onConfirm },
    });
  },

  closeDeleteConfirm: () => {
    set({
      deleteConfirmModal: { isOpen: false, title: '', message: '', onConfirm: null },
    });
  },

  openStoryUpload: (onSelect) => {
    set({
      storyUploadModal: { isOpen: true, onSelect },
    });
  },

  closeStoryUpload: () => {
    set({
      storyUploadModal: { isOpen: false },
    });
  },

  openGenerateProgress: () => {
    set({
      generateProgressModal: { isOpen: true, status: 'generating' },
    });
  },

  setGenerateStatus: (status, error) => {
    set({
      generateProgressModal: { isOpen: true, status, error },
    });
  },

  closeGenerateProgress: () => {
    set({
      generateProgressModal: { isOpen: false, status: 'idle' },
    });
  },

  addToast: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, message };

    set((state) => ({
      toasts: [...state.toasts, toast],
    }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  toggleFichero: (id) => {
    set((state) => {
      const expanded = new Set(state.expandedFicheros);
      if (expanded.has(id)) {
        expanded.delete(id);
      } else {
        expanded.add(id);
      }
      return { expandedFicheros: expanded };
    });
  },

  expandFichero: (id) => {
    set((state) => {
      const expanded = new Set(state.expandedFicheros);
      expanded.add(id);
      return { expandedFicheros: expanded };
    });
  },

  collapseFichero: (id) => {
    set((state) => {
      const expanded = new Set(state.expandedFicheros);
      expanded.delete(id);
      return { expandedFicheros: expanded };
    });
  },

  expandAllFicheros: (ids) => {
    set({ expandedFicheros: new Set(ids) });
  },

  collapseAllFicheros: () => {
    set({ expandedFicheros: new Set() });
  },
}));
