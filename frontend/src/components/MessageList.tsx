import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat.types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  onInsertCode?: (code: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onInsertCode }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 text-center">
        <div className="max-w-md">
          <div className="mb-4">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 48 48" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto text-vscode-descriptionForeground"
            >
              <path 
                d="M24 6L6 18V42L24 30L42 42V18L24 6Z" 
                stroke="currentColor" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2 text-vscode-foreground">
            Welcome to Sentinel Gemini
          </h2>
          <p className="text-sm text-vscode-descriptionForeground">
            Your secure AI assistant powered by Vertex AI. Ask questions, get code suggestions, 
            or request explanations. All interactions are monitored and secured.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 overflow-y-auto">
      {messages.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          onInsertCode={onInsertCode}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};