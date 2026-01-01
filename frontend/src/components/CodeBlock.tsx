import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  onInsert?: (code: string) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', onInsert }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleInsert = () => {
    onInsert?.(code);
  };
  
  return (
    <div className="relative group my-2">
      <div className="flex items-center justify-between px-3 py-1 bg-vscode-editor-background rounded-t border-b border-vscode-border">
        <span className="text-xs text-vscode-descriptionForeground font-code">{language}</span>
        <div className="flex items-center gap-2">
          {onInsert && (
            <button
              onClick={handleInsert}
              className="text-xs text-vscode-foreground hover:text-white px-2 py-1 rounded hover:bg-vscode-input transition-colors"
              title="Insert at cursor"
            >
              Insert
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-xs text-vscode-foreground hover:text-white px-2 py-1 rounded hover:bg-vscode-input transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: '0 0 4px 4px',
            fontSize: '12px',
            padding: '12px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};