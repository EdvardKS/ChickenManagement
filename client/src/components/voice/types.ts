export type VoiceState = 'idle' | 'listening' | 'processing' | 'error';

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  orderCreated?: boolean;
  order?: any;
  extractedData?: {
    customerName?: string;
    quantity?: number;
    pickupTime?: string;
    phone?: string;
    time?: string;
    date?: string;
  };
  message?: string;
}

export interface VoiceRule {
  name: string;
  pattern: RegExp;
  action: 'CREATE_ORDER' | 'UPDATE_ORDER' | 'CANCEL_ORDER';
  extractors: {
    [key: string]: number; // grupo de captura del regex
  };
  description: string;
}

export interface AudioVisualizerProps {
  isActive: boolean;
  audioData?: Uint8Array;
  className?: string;
}