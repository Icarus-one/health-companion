
export type GastroStatus = 'comfortable' | 'bloated' | 'pain' | 'acid_reflux';

export interface DailyLog {
  id: string;
  date: string; // ISO string
  sleepQuality: number; // 1-10
  energyLevel: number; // 1-10
  moodStatus: number; // 1-10
  gastroStatus: GastroStatus;
  symptoms: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isRedFlag?: boolean;
}

export interface HealthState {
  logs: DailyLog[];
  chatHistory: ChatMessage[];
  user: User | null;
  language: 'zh' | 'en';
}

export interface User {
  email: string;
  token: string;
}

export type AppRoute = 'landing' | 'auth' | 'app' | 'settings';
