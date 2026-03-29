export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  authToken: string | null;
}

export interface VSCodeMessage {
  type: 'AUTH_TOKEN' | 'INSERT_CODE' | 'ERROR' | 'SIGN_IN' | 'SIGN_IN_REQUIRED' | 'WEBVIEW_READY';
  value?: string;
  code?: string;
}

export interface BackendRequest {
  prompt: string;
  token: string;
  conversation_id?: string;
  stream?: boolean;
}

export interface BackendResponse {
  response?: string;
  blocked?: boolean;
  error?: string;
  metadata?: {
    model: string;
    user: string;
  };
}

export interface StreamChunk {
  type: 'token' | 'done' | 'error';
  content?: string;
  error?: string;
}