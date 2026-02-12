
import { HealthState } from '../types';

const STORAGE_KEY = 'phc_v1_data';

export const saveState = (state: HealthState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

export const loadState = (): HealthState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        logs: parsed.logs || [],
        chatHistory: parsed.chatHistory || [],
        user: parsed.user || null,
        language: parsed.language || 'zh'
      };
    } catch (e) {
      console.error("Failed to parse state", e);
    }
  }
  return { logs: [], chatHistory: [], user: null, language: 'zh' };
};

export const clearAllData = () => {
  localStorage.removeItem(STORAGE_KEY);
};
