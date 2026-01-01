/// <reference types="vite/client" />

import { useState, useCallback, useRef } from 'react';
import { Message, BackendRequest, StreamChunk } from '@/types/chat.types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const useChat = (authToken: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string>(crypto.randomUUID());
  
  const sendMessage = useCallback(async (prompt: string) => {
    if (!authToken) {
      setError('Not authenticated. Please wait for authentication.');
      return;
    }
    
    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);
    
    // Create streaming assistant message
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    
    try {
      const request: BackendRequest = {
        prompt,
        token: authToken,
        conversation_id: conversationId.current,
        stream: true,
      };
      
      const response = await fetch(`${BACKEND_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) {
        throw new Error('No response body');
      }
      
      let accumulatedContent = '';
      
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              break;
            }
            
            try {
              const parsed: StreamChunk = JSON.parse(data);
              
              if (parsed.type === 'token' && parsed.content) {
                accumulatedContent += parsed.content;
                
                // Update the assistant message with new content
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              } else if (parsed.type === 'error') {
                throw new Error(parsed.error || 'Streaming error');
              }
            } catch (parseError) {
              console.warn('Failed to parse SSE chunk:', parseError);
            }
          }
        }
      }
      
      // Mark streaming as complete
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false }
            : msg
        )
      );
      
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Remove the failed assistant message
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);
  
  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationId.current = crypto.randomUUID();
  }, []);
  
  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
};