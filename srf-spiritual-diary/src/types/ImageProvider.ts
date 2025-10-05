export type ImageProvider = 'openai' | 'gemini';

export interface GeneratedImage {
  url: string;
  provider: ImageProvider;
  timestamp: number;
  dateKey: string;
}

export interface UserSettings {
  preferredProvider: ImageProvider;
  apiKeys?: {
    openai?: string;
    gemini?: string;
  };
  fontSize: 'small' | 'medium' | 'large';
}
