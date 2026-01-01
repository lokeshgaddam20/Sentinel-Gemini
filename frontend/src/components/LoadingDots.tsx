import React from 'react';

export const LoadingDots: React.FC = () => {
  return (
    <div className="flex items-center gap-1 py-2">
      <div className="w-2 h-2 bg-vscode-foreground rounded-full loading-dot opacity-30"></div>
      <div className="w-2 h-2 bg-vscode-foreground rounded-full loading-dot opacity-30"></div>
      <div className="w-2 h-2 bg-vscode-foreground rounded-full loading-dot opacity-30"></div>
    </div>
  );
};