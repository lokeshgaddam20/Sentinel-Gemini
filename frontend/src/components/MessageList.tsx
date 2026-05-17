import React, { useEffect, useRef } from 'react';
import { Message } from '@/types/chat.types';
import { MessageBubble } from './MessageBubble';
import { ShieldIcon } from './ShieldIcon';

interface MessageListProps {
  messages: Message[];
  onInsertCode?: (code: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onInsertCode }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center px-4 text-center">
        <div className="max-w-xs">
          {/* Same shield as the icon + header */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'rgba(100,160,255,0.08)',
              border: '1px solid rgba(100,160,255,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <ShieldIcon size={36} color="#64a0ff" />
          </div>

          <h2 className="text-base font-semibold mb-2 text-vscode-foreground">
            Welcome to Sentinel Gemini
          </h2>
          <p className="text-xs text-vscode-descriptionForeground leading-relaxed">
            Your secure AI assistant powered by Vertex AI.
            All prompts are DLP-scanned before reaching the model.
          </p>

          {/* Subtle feature pills */}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
            {['🔒 DLP Protected', '☁️ Vertex AI', '⚡ Streaming'].map(label => (
              <span key={label} style={{
                fontSize: '10px',
                color: 'var(--vscode-descriptionForeground)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4,
                padding: '2px 8px',
              }}>
                {label}
              </span>
            ))}
          </div>
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