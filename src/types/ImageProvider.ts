export type ImageProvider = 'gemini';

export interface GeneratedImage {
  url: string;
  provider: ImageProvider;
  timestamp: number;
  dateKey: string;
}

export interface UserSettings {
  preferredProvider: ImageProvider;
  apiKeys?: {
    gemini?: string;
  };
  fontSize: 'small' | 'medium' | 'large';
}
