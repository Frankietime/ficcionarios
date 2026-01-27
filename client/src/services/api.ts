/**
 * API service for backend communication
 */

const API_BASE = '/api';

interface ApiError {
  error: string;
}

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error((data as ApiError).error || 'Request failed');
    }

    return data as T;
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<{ user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe() {
    return this.request<{ user: User | null }>('/auth/me');
  }

  // Ficcionarios
  async getFiccionarios() {
    return this.request<{ ficcionarios: Ficcionario[] }>('/ficcionarios');
  }

  async getFiccionario(id: number) {
    return this.request<{ ficcionario: FiccionarioWithFicheros }>(
      `/ficcionarios/${id}`
    );
  }

  async createFiccionario(data: CreateFiccionarioData) {
    return this.request<{ ficcionario: Ficcionario }>('/ficcionarios', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFiccionario(id: number, data: UpdateFiccionarioData) {
    return this.request<{ ficcionario: Ficcionario }>(`/ficcionarios/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cloneFiccionario(id: number) {
    return this.request<{ ficcionario: Ficcionario }>(`/ficcionarios/${id}/clone`, {
      method: 'POST',
    });
  }

  async deleteFiccionario(id: number) {
    return this.request<{ message: string }>(`/ficcionarios/${id}`, {
      method: 'DELETE',
    });
  }

  async generateMobi(id: number) {
    const response = await fetch(`${API_BASE}/ficcionarios/${id}/generate`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error((data as ApiError).error || 'Generation failed');
    }

    return response.blob();
  }

  // Ficheros
  async createFichero(ficcionarioId: number, data?: CreateFicheroData) {
    return this.request<{ fichero: Fichero }>(
      `/ficcionarios/${ficcionarioId}/ficheros`,
      {
        method: 'POST',
        body: JSON.stringify(data || {}),
      }
    );
  }

  async updateFichero(id: number, data: UpdateFicheroData) {
    return this.request<{ fichero: Fichero }>(`/ficcionarios/ficheros/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFichero(id: number) {
    return this.request<{ message: string }>(`/ficcionarios/ficheros/${id}`, {
      method: 'DELETE',
    });
  }

  // Stories
  async getStories(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{ stories: Story[] }>(`/stories${params}`);
  }

  async createStory(data: CreateStoryData) {
    return this.request<{ story: Story; isDuplicate: boolean; message?: string }>(
      '/stories',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async deleteStory(id: number) {
    return this.request<{ message: string }>(`/stories/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

// Types
export interface User {
  id: number;
  username: string;
  createdAt: string;
}

export interface Ficcionario {
  id: number;
  title: string;
  version: string;
  authors: string | null;
  inLanguage: string;
  outLanguage: string;
  outputName: string | null;
  coverImagePath: string | null;
  copyright: string | null;
  createdBy: User | null;
  updatedBy: User | null;
  createdAt: string;
  updatedAt: string;
  ficheroCount: number;
  storyCount: number;
  storyTitles: string[];
}

export interface Story {
  id: number;
  title: string;
  content: string;
  contentHash: string;
  createdBy: User | null;
  createdAt: string;
}

export interface Term {
  id: number;
  ficheroId: number;
  word: string;
}

export interface Fichero {
  id: number;
  ficcionarioId: number;
  storyId: number | null;
  story: Story | null;
  position: number;
  terms: Term[];
}

export interface FiccionarioWithFicheros extends Ficcionario {
  ficheros: Fichero[];
}

export interface CreateFiccionarioData {
  title: string;
  version?: string;
  authors?: string;
  inLanguage?: string;
  outLanguage?: string;
  outputName?: string;
  copyright?: string;
}

export interface UpdateFiccionarioData {
  title?: string;
  version?: string;
  authors?: string;
  inLanguage?: string;
  outLanguage?: string;
  outputName?: string;
  copyright?: string;
}

export interface CreateFicheroData {
  storyId?: number;
  terms?: string[];
}

export interface UpdateFicheroData {
  storyId?: number;
  position?: number;
  terms?: string[];
}

export interface CreateStoryData {
  title: string;
  content: string;
}
