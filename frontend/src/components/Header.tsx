import React from 'react';

interface HeaderProps {
  onClearChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-vscode-border bg-vscode-sidebar">
      <div className="flex items-center gap-3">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 16 16" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-vscode-foreground"
        >
          <path 
            d="M8 2L2 6V14L8 10L14 14V6L8 2Z" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-semibold text-sm">Sentinel Gemini</span>
      </div>
      
      <div className="flex items-center gap-2">
        <select 
          className="bg-vscode-input text-vscode-foreground text-xs px-2 py-1 rounded border border-vscode-border focus:outline-none focus:border-vscode-focus"
          defaultValue="gemini-pro"
        >
          <option value="gemini-pro">Gemini Pro</option>
          <option value="gemini-pro-vision">Gemini Pro Vision</option>
        </select>
        
        <button
          onClick={onClearChat}
          className="text-vscode-foreground hover:text-white p-1 rounded hover:bg-vscode-input transition-colors"
          title="Clear chat"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path 
              d="M3 4H13M5 4V3C5 2.44772 5.44772 2 6 2H10C10.5523 2 11 2.44772 11 3V4M6 7V11M10 7V11M4 4L5 13C5 13.5523 5.44772 14 6 14H10C10.5523 14 11 13.5523 11 13L12 4" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};