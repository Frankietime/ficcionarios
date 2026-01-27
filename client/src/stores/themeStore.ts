/**
 * Theme store: color theme (17 neobrutalism colors) + dark mode toggle.
 * Persists to localStorage. Applies CSS variables at runtime.
 */
import { create } from 'zustand';

interface ThemeColors {
  light: { bg: string; main: string };
  dark: { bg: string; main: string };
}

export const COLOR_THEMES: Record<string, ThemeColors> = {
  red:     { light: { bg: 'oklch(0.808 0.114 19.247)', main: 'oklch(0.637 0.237 25.331)' }, dark: { bg: 'oklch(0.258 0.092 26.042)', main: 'oklch(0.637 0.237 25.331)' } },
  orange:  { light: { bg: 'oklch(0.874 0.098 75.164)', main: 'oklch(0.792 0.162 56.518)' }, dark: { bg: 'oklch(0.282 0.067 45.815)', main: 'oklch(0.792 0.162 56.518)' } },
  amber:   { light: { bg: 'oklch(0.914 0.089 91.605)', main: 'oklch(0.828 0.152 84.071)' }, dark: { bg: 'oklch(0.279 0.077 75.166)', main: 'oklch(0.828 0.152 84.071)' } },
  yellow:  { light: { bg: 'oklch(0.943 0.089 101.726)', main: 'oklch(0.879 0.169 91.605)' }, dark: { bg: 'oklch(0.279 0.077 85.166)', main: 'oklch(0.879 0.169 91.605)' } },
  lime:    { light: { bg: 'oklch(0.923 0.098 125.669)', main: 'oklch(0.841 0.179 120.259)' }, dark: { bg: 'oklch(0.269 0.082 132.109)', main: 'oklch(0.841 0.179 120.259)' } },
  green:   { light: { bg: 'oklch(0.893 0.098 146.687)', main: 'oklch(0.765 0.177 148.091)' }, dark: { bg: 'oklch(0.262 0.082 152.935)', main: 'oklch(0.765 0.177 148.091)' } },
  emerald: { light: { bg: 'oklch(0.882 0.082 166.37)', main: 'oklch(0.761 0.152 166.37)' }, dark: { bg: 'oklch(0.262 0.072 172.109)', main: 'oklch(0.761 0.152 166.37)' } },
  teal:    { light: { bg: 'oklch(0.876 0.065 184.704)', main: 'oklch(0.773 0.117 184.704)' }, dark: { bg: 'oklch(0.262 0.056 192.109)', main: 'oklch(0.773 0.117 184.704)' } },
  cyan:    { light: { bg: 'oklch(0.886 0.074 205.876)', main: 'oklch(0.789 0.139 200.723)' }, dark: { bg: 'oklch(0.262 0.062 210.109)', main: 'oklch(0.789 0.139 200.723)' } },
  sky:     { light: { bg: 'oklch(0.876 0.074 224.279)', main: 'oklch(0.746 0.152 232.661)' }, dark: { bg: 'oklch(0.262 0.062 230.109)', main: 'oklch(0.746 0.152 232.661)' } },
  blue:    { light: { bg: '#e0d4fc', main: '#88aaee' }, dark: { bg: '#1a1625', main: '#88aaee' } },
  indigo:  { light: { bg: 'oklch(0.857 0.088 272.039)', main: 'oklch(0.673 0.182 274.532)' }, dark: { bg: 'oklch(0.257 0.082 276.935)', main: 'oklch(0.673 0.182 274.532)' } },
  violet:  { light: { bg: 'oklch(0.874 0.098 289.042)', main: 'oklch(0.702 0.183 293.541)' }, dark: { bg: 'oklch(0.262 0.082 292.109)', main: 'oklch(0.702 0.183 293.541)' } },
  purple:  { light: { bg: 'oklch(0.868 0.104 302.4)', main: 'oklch(0.682 0.192 304.674)' }, dark: { bg: 'oklch(0.262 0.088 306.109)', main: 'oklch(0.682 0.192 304.674)' } },
  fuchsia: { light: { bg: 'oklch(0.874 0.104 322.15)', main: 'oklch(0.712 0.202 326.328)' }, dark: { bg: 'oklch(0.262 0.088 326.109)', main: 'oklch(0.712 0.202 326.328)' } },
  pink:    { light: { bg: 'oklch(0.868 0.098 346.018)', main: 'oklch(0.718 0.176 349.761)' }, dark: { bg: 'oklch(0.262 0.082 350.109)', main: 'oklch(0.718 0.176 349.761)' } },
  rose:    { light: { bg: 'oklch(0.852 0.104 8.3)', main: 'oklch(0.681 0.199 11.864)' }, dark: { bg: 'oklch(0.258 0.088 12.042)', main: 'oklch(0.681 0.199 11.864)' } },
};

export const THEME_NAMES = Object.keys(COLOR_THEMES);

interface ThemeState {
  colorTheme: string;
  isDark: boolean;
  setColorTheme: (name: string) => void;
  toggleDark: () => void;
  applyTheme: () => void;
}

function loadPersistedTheme(): { colorTheme: string; isDark: boolean } {
  try {
    const stored = localStorage.getItem('ficcionarios-theme');
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { colorTheme: 'blue', isDark: false };
}

function persistTheme(colorTheme: string, isDark: boolean) {
  localStorage.setItem('ficcionarios-theme', JSON.stringify({ colorTheme, isDark }));
}

function applyToDOM(colorTheme: string, isDark: boolean) {
  const theme = COLOR_THEMES[colorTheme] ?? COLOR_THEMES.blue;
  const mode = isDark ? theme.dark : theme.light;
  const root = document.documentElement;

  root.style.setProperty('--color-background', mode.bg);
  root.style.setProperty('--color-main', mode.main);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

const initial = loadPersistedTheme();

export const useThemeStore = create<ThemeState>((set, get) => ({
  colorTheme: initial.colorTheme,
  isDark: initial.isDark,

  setColorTheme: (name: string) => {
    set({ colorTheme: name });
    const { isDark } = get();
    persistTheme(name, isDark);
    applyToDOM(name, isDark);
  },

  toggleDark: () => {
    const { isDark, colorTheme } = get();
    const next = !isDark;
    set({ isDark: next });
    persistTheme(colorTheme, next);
    applyToDOM(colorTheme, next);
  },

  applyTheme: () => {
    const { colorTheme, isDark } = get();
    applyToDOM(colorTheme, isDark);
  },
}));

// Apply on load
applyToDOM(initial.colorTheme, initial.isDark);
