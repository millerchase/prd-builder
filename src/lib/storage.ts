import { PersistedState, AppState, Message, PRDDocument } from './types';

const STORAGE_KEY = 'prd-builder-state';

const DEFAULT_STATE: PersistedState = {
  state: 'idle',
  messages: [],
  prd: null,
  clarificationRound: 0,
  originalIdea: '',
};

export function loadState(): PersistedState {
  if (typeof window === 'undefined') {
    return DEFAULT_STATE;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_STATE;
    }
    const parsed = JSON.parse(stored) as PersistedState;
    // Validate required fields exist
    if (!parsed.state || !Array.isArray(parsed.messages)) {
      return DEFAULT_STATE;
    }
    return parsed;
  } catch (error) {
    console.warn('Failed to load state from localStorage:', error);
    return DEFAULT_STATE;
  }
}

export function saveState(state: PersistedState): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    console.warn('Failed to save state to localStorage:', error);
    return false;
  }
}

export function clearState(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.warn('Failed to clear state from localStorage:', error);
    return false;
  }
}
