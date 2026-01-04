
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: GroundingSource[];
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface DesignStyle {
  id: string;
  name: string;
  description: string;
  prompt: string;
  previewUrl: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  GENERATING = 'GENERATING',
  EDITING = 'EDITING',
  READY = 'READY'
}
