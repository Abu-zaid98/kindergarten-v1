import { create } from 'zustand';
import { currentPeriod } from '../utils/dates';

const THEME_KEY = 'kg_theme';
const PERIOD_KEY = 'kg_period';
const period = readPeriod();

function readPeriod() {
  try {
    const raw = JSON.parse(localStorage.getItem(PERIOD_KEY) || 'null');
    if (raw && Number(raw.month) >= 1 && Number(raw.year) > 2000) {
      return { month: Number(raw.month), year: Number(raw.year) };
    }
  } catch {
    /* ignore */
  }
  return currentPeriod();
}

function readTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function applyTheme(theme) {
  const dark = theme === 'dark';
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

const savedTheme = readTheme();
applyTheme(savedTheme);

export const useAppStore = create((set, get) => ({
  isAuthenticated: sessionStorage.getItem('kg_auth') === '1',
  selectedMonth: period.month,
  selectedYear: period.year,
  printReceipt: null,
  theme: savedTheme,
  installPrompt: null,
  setAuthenticated: (value) => {
    if (value) sessionStorage.setItem('kg_auth', '1');
    else sessionStorage.removeItem('kg_auth');
    set({ isAuthenticated: value });
  },
  setPeriod: (month, year) => {
    const next = { selectedMonth: Number(month), selectedYear: Number(year) };
    try {
      localStorage.setItem(PERIOD_KEY, JSON.stringify({ month: next.selectedMonth, year: next.selectedYear }));
    } catch {
      /* ignore */
    }
    set(next);
  },
  setInstallPrompt: (installPrompt) => set({ installPrompt }),
  setPrintReceipt: (printReceipt) => set({ printReceipt }),
  setTheme: (theme) => {
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    set({ theme });
  },
}));
