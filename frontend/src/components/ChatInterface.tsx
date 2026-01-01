import React, { useState } from 'react';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { useChat } from '@/hooks/useChat';
import { useVSCodeAPI } from '@/hooks/useVSCodeAPI';

export const ChatInterface: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { insertCode } = useVSCodeAPI(
    (token) => {
      setAuthToken(token);
      setAuthError(null);
    },
    (error) => setAuthError(error)
  );
  
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(authToken);
  
  const handleInsertCode = (code: string) => {
    insertCode(code);
  };
  
  // Show authentication status
  if (!authToken && !authError) {
    return (
      <div className="h-screen flex items-center justify-center bg-vscode-sidebar">
        <div className="text-center">
          <div className="mb-4">
            <svg 
              className="animate-spin h-8 w-8 mx-auto text-vscode-foreground" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-vscode-foreground">Authenticating with Google...</p>
        </div>
      </div>
    );
  }
  
  if (authError) {
    return (
      <div className="h-screen flex items-center justify-center bg-vscode-sidebar px-4">
        <div className="max-w-md text-center">
          <div className="mb-4">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 48 48" 
              fill="none" 
              className="mx-auto text-red-500"
            >
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" />
              <path d="M24 14V26M24 32V34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2 text-vscode-foreground">
            Authentication Failed
          </h2>
          <p className="text-sm text-vscode-descriptionForeground mb-4">
            {authError}
          </p>
          <p className="text-xs text-vscode-descriptionForeground">
            Please reload the window and try again.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-vscode-sidebar">
      <Header onClearChat={clearMessages} />
      
      <MessageList 
        messages={messages}
        onInsertCode={handleInsertCode}
      />
      
      {error && (
        <div className="px-4 py-2 bg-red-900/20 border-t border-red-500/50 text-red-400 text-sm">
          Error: {error}
        </div>
      )}
      
      <InputBox 
        onSendMessage={sendMessage}
        disabled={isLoading || !authToken}
      />
    </div>
  );
};