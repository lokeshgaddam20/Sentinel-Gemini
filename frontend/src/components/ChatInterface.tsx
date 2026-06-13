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
    postMessage({ type: 'SIGN_IN' });
  };

  // ── LOADING STATE ─────────────────────────────────────────────────────────
  if (authState === 'loading') {
    return (
      <div style={styles.centered}>
        <div style={styles.spinnerContainer}>
          <div style={styles.spinner} />
          <div style={styles.spinnerPulse} />
        </div>
        <p style={styles.loadingLabel}>Connecting securely to Sentinel Gemini…</p>
      </div>
    );
  }

  // ── SIGN IN REQUIRED ──────────────────────────────────────────────────────
  if (authState === 'sign_in_required') {
    return (
      <div style={styles.centered}>
        <div style={styles.brandHeroContainer}>
          <div style={styles.iconWrapper}>
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="46" fill="rgba(79, 142, 247, 0.04)" stroke="var(--vscode-button-background, #4f8ef7)" strokeWidth="2.5" strokeDasharray="4 3"/>
              <path d="M50 20 L53 43 L75 43 L56 55 L63 78 L50 64 L37 78 L44 55 L25 43 L47 43 Z" fill="var(--vscode-button-background, #4f8ef7)" stroke="var(--vscode-button-background, #4f8ef7)" strokeWidth="1" strokeLinejoin="round"/>
              <circle cx="50" cy="50" r="5" fill="var(--vscode-sideBar-background, #1e1e2e)"/>
            </svg>
          </div>
          <h2 style={styles.title}>Sentinel Gemini</h2>
          <p style={styles.subtitle}>Enterprise Guardrails & Secure Vertex AI Context Engine</p>
        </div>

        <div style={styles.actionCard}>
          <button style={styles.signInBtn} onClick={handleSignIn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6 }}>
              <path d="M21.35 11.1H12v2.7h5.38c-.23 1.28-.96 2.37-2.04 3.1v2.58h3.3c1.93-1.78 3.04-4.4 3.04-7.48 0-.61-.06-1.21-.13-1.9z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.3-2.58c-.92.62-2.1.98-3.98.98-3.07 0-5.67-2.08-6.6-4.88H2V16.5C3.81 20.12 7.54 23 12 23z" fill="#34A853"/>
              <path d="M5.4 13.86c-.24-.72-.38-1.5-.38-2.31s.14-1.59.38-2.31V6.66H2A9.99 9.99 0 0 0 2 16.5l3.4-2.64z" fill="#FBBC05"/>
              <path d="M12 5c1.62 0 3.08.56 4.22 1.64l3.16-3.16C17.45 1.68 14.96 1 12 1 7.54 1 3.81 3.88 2 7.5l3.4 2.64c.93-2.8 3.53-4.88 12-4.88z" fill="#EA4335"/>
            </svg>
            Sign in with Google Workspace
          </button>
          
          <div style={styles.dividerRow}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>DEVELOPMENT</span>
            <span style={styles.dividerLine}></span>
          </div>

          <span style={styles.devLink} onClick={() => setAuthState('authenticated')}>
            Bypass Authentication (Sandbox Mode)
          </span>
        </div>
      </div>
    );
  }

  // ── AUTH ERROR ────────────────────────────────────────────────────────────
  if (authState === 'error') {
    return (
      <div style={styles.centered}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠</div>
          <p style={styles.errorText}>{authError || 'Authentication lifecycle failed'}</p>
        </div>
        <button style={styles.retryBtn} onClick={() => setAuthState('loading')}>
          Re-initialize Session
        </button>
      </div>
    );
  }

  // ── MAIN RUNTIME INTERFACE ────────────────────────────────────────────────
  return (
    <div style={styles.chatRoot}>
      <Header onClearChat={clearMessages} />

      <div style={styles.messageListContainer}>
        <MessageList
          messages={messages}
          onInsertCode={handleInsertCode}
        />
      </div>

      {error && (
        <div style={styles.errorBanner}>
          <span style={{ fontWeight: 600 }}>API Exception:</span> {error}
        </div>
      )}

      <div style={styles.inputStickyWrapper}>
        <InputBox
          onSendMessage={sendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

// ── HIGH DENSITY IDE INLINE STYLES ──────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  chatRoot: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--vscode-sideBar-background, #1e1e2e)',
    fontFamily: 'var(--vscode-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)',
    overflow: 'hidden',
  },
  centered: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'var(--vscode-sideBar-background, #1e1e2e)',
    boxSizing: 'border-box',
  },
  spinnerContainer: {
    position: 'relative',
    width: 32,
    height: 32,
    marginBottom: 14,
  },
  spinner: {
    width: 32,
    height: 32,
    border: '2px solid var(--vscode-panel-border, rgba(255,255,255,0.08))',
    borderTop: '2px solid var(--vscode-button-background, #4f8ef7)',
    borderRadius: '50%',
    animation: 'spin 0.75s cubic-bezier(0.4, 0, 0.2, 1) infinite',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  spinnerPulse: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'var(--vscode-button-background, #4f8ef7)',
    opacity: 0.1,
    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
  },
  loadingLabel: {
    color: 'var(--vscode-descriptionForeground, #a6adc8)',
    fontSize: '11px',
    letterSpacing: '0.02em',
    fontWeight: 400,
  },
  brandHeroContainer: {
    marginBottom: 20,
    textAlign: 'center',
  },
  iconWrapper: {
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    color: 'var(--vscode-foreground, #cdd6f4)',
    fontSize: '15px',
    fontWeight: 600,
    letterSpacing: '-0.01em',
    margin: '0 0 4px 0',
  },
  subtitle: {
    color: 'var(--vscode-descriptionForeground, #a6adc8)',
    fontSize: '11px',
    lineHeight: '1.4',
    margin: 0,
    maxWidth: '210px',
  },
  actionCard: {
    background: 'var(--vscode-editor-background, #1e1e2e)',
    border: '1px solid var(--vscode-panel-border, rgba(255,255,255,0.08))',
    borderRadius: '6px',
    padding: '14px',
    width: '100%',
    maxWidth: '240px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  signInBtn: {
    background: 'var(--vscode-button-background, #4f8ef7)',
    color: 'var(--vscode-button-foreground, #fff)',
    border: 'none',
    borderRadius: '4px',
    padding: '6px 12px',
    fontSize: '11px',
    fontWeight: 500,
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.15s ease',
  },
  dividerRow: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    margin: '12px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--vscode-panel-border, rgba(255,255,255,0.08))',
  },
  dividerText: {
    fontSize: '9px',
    color: 'var(--vscode-textSeparator-foreground, #585b70)',
    padding: '0 6px',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  devLink: {
    color: 'var(--vscode-textLink-foreground, #4f8ef7)',
    fontSize: '11px',
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'opacity 0.15s ease',
    fontWeight: 400,
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    background: 'var(--vscode-inputValidation-errorBackground, rgba(239,68,68,0.1))',
    border: '1px solid var(--vscode-inputValidation-errorBorder, #f87171)',
    borderRadius: '4px',
    padding: '10px 12px',
    maxWidth: '260px',
    marginBottom: 12,
  },
  errorIcon: {
    color: 'var(--vscode-errorForeground, #f87171)',
    fontSize: '12px',
    marginRight: '8px',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'var(--vscode-foreground, #cdd6f4)',
    fontSize: '11px',
    lineHeight: '1.4',
    margin: 0,
    textAlign: 'left',
  },
  retryBtn: {
    background: 'transparent',
    color: 'var(--vscode-foreground, #cdd6f4)',
    border: '1px solid var(--vscode-panel-border, rgba(255,255,255,0.2))',
    borderRadius: '4px',
    padding: '5px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  messageListContainer: {
    flex: 1,
    overflowY: 'auto',
  },
  errorBanner: {
    padding: '6px 12px',
    background: 'var(--vscode-inputValidation-errorBackground, rgba(239,68,68,0.12))',
    borderTop: '1px solid var(--vscode-inputValidation-errorBorder, rgba(239,68,68,0.3))',
    color: 'var(--vscode-errorForeground, #f87171)',
    fontSize: '11px',
    fontFamily: 'var(--vscode-editor-font-family, monospace)',
  },
  inputStickyWrapper: {
    borderTop: '1px solid var(--vscode-panel-border, rgba(255,255,255,0.06))',
    background: 'var(--vscode-sideBar-background, #1e1e2e)',
  },
};