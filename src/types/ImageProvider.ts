export type ImageProvider = 'openai' | 'google';

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
    google?: string;
  };
  fontSize: 'small' | 'medium' | 'large';
}

