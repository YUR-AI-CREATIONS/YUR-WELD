

export type AIModel = 
  | 'ORACLE_PRIME' 
  | 'ORACLE_LITE' 
  | 'CORE_FAST'
  | 'CORE_GEO'
  | 'SYNTH_EDIT'
  | 'SYNTH_HD'
  | 'TEMPORAL_VEO'
  | 'ACOUSTIC_LIVE'
  | 'GROK_X'
  | 'CHAT_GPT_4'
  | 'CLAUDE_3'
  | 'KLING_V';

export interface User {
  id: string;
  email: string;
  isSubscribed: boolean;
  tier: 'BASIC' | 'ELITE';
  credits: number;
}

// Added Project interface to resolve import errors in apiService.ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  nodes: NeuralNode[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
  content?: string;
  data?: string;
  mimeType?: string;
  isOpen?: boolean;
  isTrained?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  groundingUrls?: string[];
  isThinking?: boolean;
  isSynaptic?: boolean;
}

export interface VoiceSettings {
  voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  speed: number;
  deepness: number;
  softness: number;
  elegance: number;
  arrogance: number;
}

export interface NeuralNode {
  id: string;
  name: string;
  parentId?: string;
  dna: string;
  model: AIModel;
  files: FileMetadata[];
  history: ChatMessage[];
  status: 'IDLE' | 'TRAINING' | 'ACTIVE';
}

export interface WindowConfig {
  id: string;
  title: string;
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  icon: string;
}