
export interface HaikuResult {
  id: string;
  poem: string;
  japanesePoem: string;
  imageUrl: string;
  keywords: string;
  timestamp: number;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  GENERATING_POEM = 'GENERATING_POEM',
  GENERATING_IMAGE = 'GENERATING_IMAGE',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
