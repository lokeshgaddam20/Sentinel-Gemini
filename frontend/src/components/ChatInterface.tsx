import React, { useState, useCallback } from 'react';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { InputBox } from './InputBox';
import { useChat } from '@/hooks/useChat';
import { useVSCodeAPI } from '@/hooks/useVSCodeAPI';

type AuthState = 'loading' | 'authenticated' | 'sign_in_required' | 'error';

export const ChatInterface: React.FC = () => {
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [authError, setAuthError] = useState<string | null>(null);

  const onAuthToken = useCallback((token: string) => {
    setAuthToken(token);
    setAuthState('authenticated');
    setAuthError(null);
  }, []);

  const onError = useCallback((error: string) => {
    setAuthError(error);
    setAuthState('error');
  }, []);

  const onSignInRequired = useCallback(() => {
    setAuthState('sign_in_required');
  }, []);

  const { insertCode, postMessage } = useVSCodeAPI(onAuthToken, onError, onSignInRequired);
  const { messages, isLoading, error, sendMessage, clearMessages } = useChat(authToken);

  const handleInsertCode = (code: string) => insertCode(code);

  const handleSignIn = () => {
    // Ask the extension host to trigger sign-in
    postMessage({ type: 'SIGN_IN' });
  };

  // ── Loading state (waiting for first message from extension) ──────────────
  if (authState === 'loading') {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner} />
        <p style={styles.label}>Connecting to Sentinel Gemini…</p>
      </div>
    );
  }

  // ── Sign-in required ──────────────────────────────────────────────────────
  if (authState === 'sign_in_required') {
    return (
      <div style={styles.centered}>
        <div style={styles.iconWrapper}>
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#1a1a2e" stroke="#4f8ef7" strokeWidth="2"/>
            <polygon points="50,12 54,42 50,48 46,42" fill="#4f8ef7"/>
            <polygon points="88,50 58,54 52,50 58,46" fill="#4f8ef7"/>
            <polygon points="50,88 46,58 50,52 54,58" fill="#4f8ef7"/>
            <polygon points="12,50 42,46 48,50 42,54" fill="#4f8ef7"/>
            <circle cx="50" cy="50" r="8" fill="#7ab4ff"/>
          </svg>
        </div>
        <h2 style={styles.title}>Sentinel Gemini</h2>
        <p style={styles.subtitle}>Sign in to start chatting with your AI assistant</p>
        <button style={styles.signInBtn} onClick={handleSignIn}>
          Sign in with Microsoft
        </button>
        <p style={styles.devNote}>
          Or{' '}
          <span
            style={styles.devLink}
            onClick={() => setAuthState('authenticated')}
          >
            continue without auth (dev mode)
          </span>
        </p>
      </div>
    );
  }

  // ── Auth error ────────────────────────────────────────────────────────────
  if (authState === 'error') {
    return (
      <div style={styles.centered}>
        <p style={{ color: '#f87171', marginBottom: 8 }}>⚠ {authError}</p>
        <button style={styles.signInBtn} onClick={() => setAuthState('loading')}>
          Retry
        </button>
      </div>
    );
  }

  // ── Main chat UI (authenticated or dev mode) ──────────────────────────────
  return (
    <div style={styles.chatRoot}>
      <Header onClearChat={clearMessages} />

      <MessageList
        messages={messages}
        onInsertCode={handleInsertCode}
      />

      {error && (
        <div style={styles.errorBanner}>
          Error: {error}
        </div>
      )}

      <InputBox
        onSendMessage={sendMessage}
        disabled={isLoading}
      />
    </div>
  );
};

// ── Inline styles (no Tailwind dependency) ────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  centered: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--vscode-sideBar-background, #1e1e2e)',
    textAlign: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    border: '3px solid rgba(255,255,255,0.15)',
    borderTop: '3px solid #4f8ef7',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    marginBottom: 16,
  },
  label: {
    color: 'var(--vscode-foreground, #cdd6f4)',
    fontSize: 14,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  title: {
    color: 'var(--vscode-foreground, #cdd6f4)',
    fontSize: 18,
    fontWeight: 600,
    marginBottom: 8,
  },
  subtitle: {
    color: 'var(--vscode-descriptionForeground, #a6adc8)',
    fontSize: 13,
    marginBottom: 24,
    maxWidth: 240,
  },
  signInBtn: {
    background: '#4f8ef7',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: 16,
  },
  devNote: {
    color: 'var(--vscode-descriptionForeground, #a6adc8)',
    fontSize: 11,
  },
  devLink: {
    color: '#4f8ef7',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  chatRoot: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--vscode-sideBar-background, #1e1e2e)',
  },
  errorBanner: {
    padding: '8px 16px',
    background: 'rgba(239,68,68,0.15)',
    borderTop: '1px solid rgba(239,68,68,0.4)',
    color: '#f87171',
    fontSize: 13,
  },
};