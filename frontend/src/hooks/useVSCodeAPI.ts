import { useEffect, useCallback, useRef } from 'react';
import { VSCodeMessage } from '@/types/chat.types';

// Get VS Code API instance (injected by the extension)
declare global {
  interface Window {
    acquireVsCodeApi?: () => VSCodeAPI;
  }
}

interface VSCodeAPI {
  postMessage(message: VSCodeMessage): void;
  setState(state: any): void;
  getState(): any;
}

let vscodeApi: VSCodeAPI | null = null;

export const getVSCodeAPI = (): VSCodeAPI | null => {
  if (vscodeApi) {
    return vscodeApi;
  }
  
  if (typeof window.acquireVsCodeApi !== 'undefined') {
    vscodeApi = window.acquireVsCodeApi();
    return vscodeApi;
  }
  
  return null;
};

export const useVSCodeAPI = (
  onAuthToken?: (token: string) => void,
  onError?: (error: string) => void
) => {
  const api = useRef<VSCodeAPI | null>(null);
  
  useEffect(() => {
    api.current = getVSCodeAPI();
    
    // Listen for messages from the extension
    const messageHandler = (event: MessageEvent<VSCodeMessage>) => {
      const message = event.data;
      
      switch (message.type) {
        case 'AUTH_TOKEN':
          if (message.value && onAuthToken) {
            onAuthToken(message.value);
          }
          break;
        case 'ERROR':
          if (message.value && onError) {
            onError(message.value);
          }
          break;
      }
    };
    
    window.addEventListener('message', messageHandler);
    
    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, [onAuthToken, onError]);
  
  const postMessage = useCallback((message: VSCodeMessage) => {
    api.current?.postMessage(message);
  }, []);
  
  const insertCode = useCallback((code: string) => {
    postMessage({ type: 'INSERT_CODE', code });
  }, [postMessage]);
  
  return { postMessage, insertCode };
};