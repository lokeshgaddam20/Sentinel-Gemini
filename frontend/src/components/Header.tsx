import React from 'react';
import { ShieldIcon } from './ShieldIcon';

interface HeaderProps {
  onClearChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-vscode-border bg-vscode-sidebar">
      <div className="flex items-center gap-2">
        <ShieldIcon size={18} color="#64a0ff" />
        <span className="font-semibold text-sm">Sentinel Gemini</span>
      </div>

      <button
        onClick={onClearChat}
        className="text-vscode-foreground hover:text-white p-1 rounded hover:bg-vscode-input transition-colors"
        title="Clear chat"
      >
        <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
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
  );
};