import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '@/types/chat.types';
import { CodeBlock } from './CodeBlock';
import { LoadingDots } from './LoadingDots';

interface MessageBubbleProps {
  message: Message;
  onInsertCode?: (code: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onInsertCode }) => {
  const isUser = message.role === 'user';
  const initials = isUser ? 'ME' : 'AI';
  
  return (
    <div className={`flex gap-3 px-4 py-3 message-fade-in ${isUser ? 'bg-transparent' : 'bg-vscode-sidebar'}`}>
      {/* Avatar */}
      <div 
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
          isUser 
            ? 'bg-vscode-button text-white' 
            : 'bg-vscode-input text-vscode-foreground'
        }`}
      >
        {initials}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {isUser ? (
          <div className="text-sm text-vscode-foreground whitespace-pre-wrap break-words">
            {message.content}
          </div>
        ) : (
          <div className="text-sm text-vscode-foreground">
            {message.isStreaming && !message.content ? (
              <LoadingDots />
            ) : (
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    
                    return match ? (
                      <CodeBlock 
                        code={codeString} 
                        language={match[1]} 
                        onInsert={onInsertCode}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                  p({ children }) {
                    return <p className="mb-3 last:mb-0">{children}</p>;
                  },
                  ul({ children }) {
                    return <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>;
                  },
                  ol({ children }) {
                    return <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>;
                  },
                  h1({ children }) {
                    return <h1 className="text-lg font-bold mb-2 mt-4">{children}</h1>;
                  },
                  h2({ children }) {
                    return <h2 className="text-base font-bold mb-2 mt-3">{children}</h2>;
                  },
                  h3({ children }) {
                    return <h3 className="text-sm font-bold mb-2 mt-2">{children}</h3>;
                  },
                  blockquote({ children }) {
                    return (
                      <blockquote className="border-l-4 border-vscode-focus pl-3 italic text-vscode-descriptionForeground mb-3">
                        {children}
                      </blockquote>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            )}
            
            {message.isStreaming && (
              <span className="inline-block w-1 h-4 bg-vscode-foreground ml-1 animate-pulse"></span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};