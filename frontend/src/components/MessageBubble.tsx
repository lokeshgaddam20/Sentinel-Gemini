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
  const initials = isUser ? 'Me' : 'AI';
  const bubbleClasses = isUser
    ? 'bg-vscode-button text-vscode-button-foreground border-transparent'
    : 'bg-vscode-input text-vscode-foreground border-vscode-border';
  
  return (
    <div className={`flex px-3 py-1.5 message-fade-in ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`flex items-end gap-2 max-w-[92%] ${isUser ? 'flex-row-reverse ml-auto' : 'mr-auto'}`}
      >
        <div
          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold ${
            isUser
              ? 'bg-vscode-button text-white'
              : 'bg-vscode-bg text-vscode-foreground border border-vscode-border'
          }`}
        >
          {initials}
        </div>

        <div className="min-w-0">
          <div
            className={`rounded-lg border px-2.5 py-2 text-[11px] leading-[1.45] shadow-sm whitespace-normal break-words ${bubbleClasses}`}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.content}</div>
            ) : (
              <div>
                {message.isStreaming && !message.content ? (
                  <LoadingDots />
                ) : (
                  <ReactMarkdown
                    components={{
                      code({ node, className, children, ...props }: any) {
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
                      p({ children }: any) {
                        return <p className="mb-2 last:mb-0">{children}</p>;
                      },
                      ul({ children }: any) {
                        return <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>;
                      },
                      ol({ children }: any) {
                        return <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>;
                      },
                      h1({ children }: any) {
                        return <h1 className="text-sm font-semibold mb-1.5 mt-2">{children}</h1>;
                      },
                      h2({ children }: any) {
                        return <h2 className="text-xs font-semibold mb-1.5 mt-2">{children}</h2>;
                      },
                      h3({ children }: any) {
                        return <h3 className="text-[11px] font-semibold mb-1 mt-1.5">{children}</h3>;
                      },
                      blockquote({ children }: any) {
                        return (
                          <blockquote className="border-l-2 border-vscode-focus pl-2 italic text-vscode-descriptionForeground mb-2">
                            {children}
                          </blockquote>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
                
                {message.isStreaming && message.content && (
                  <span className="inline-block w-1 h-3 bg-vscode-foreground ml-0.5 animate-pulse align-middle"></span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
