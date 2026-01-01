import React, { useState, useRef, KeyboardEvent } from 'react';

interface InputBoxProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export const InputBox: React.FC<InputBoxProps> = ({ onSendMessage, disabled }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSendMessage(trimmed);
      setInput('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-expand textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines (~24px per line)
    textarea.style.height = `${newHeight}px`;
  };
  
  return (
    <div className="border-t border-vscode-border bg-vscode-sidebar px-4 py-3">
      <div className="flex items-end gap-2">
        {/* Attachment button (placeholder for future feature) */}
        <button
          className="flex-shrink-0 p-2 text-vscode-foreground hover:text-white rounded hover:bg-vscode-input transition-colors disabled:opacity-50"
          disabled={disabled}
          title="Attach file (coming soon)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M10 3V15M10 15L6 11M10 15L14 11" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        
        {/* Input textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot..."
            disabled={disabled}
            className="w-full bg-vscode-input text-vscode-foreground placeholder-vscode-descriptionForeground px-3 py-2 rounded resize-none focus:outline-none focus:ring-1 focus:ring-vscode-focus disabled:opacity-50"
            style={{ minHeight: '38px', maxHeight: '120px' }}
            rows={1}
          />
        </div>
        
        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="flex-shrink-0 p-2 bg-vscode-button text-white rounded hover:bg-vscode-button-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed action-button"
          title="Send message (Enter)"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path 
              d="M18 2L9 11M18 2L12 18L9 11M18 2L2 8L9 11" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      <div className="text-xs text-vscode-descriptionForeground mt-2">
        Press Enter to send, Shift+Enter for new line
      </div>
    </div>
  );
};