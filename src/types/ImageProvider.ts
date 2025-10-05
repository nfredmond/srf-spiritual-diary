export type ImageProvider = 'openai';

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
  };
  fontSize: 'small' | 'medium' | 'large';
}
