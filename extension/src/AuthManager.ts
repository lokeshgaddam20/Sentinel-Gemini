import * as vscode from 'vscode';

export class AuthManager {
  private static instance: AuthManager;
  private currentSession: vscode.AuthenticationSession | null = null;

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  /**
   * Get authentication session.
   * Uses Microsoft authentication (built-in to VS Code).
   * Falls back to a dev-mode token if running without auth in testing.
   */
  public async getGoogleSession(): Promise<vscode.AuthenticationSession | null> {
    try {
      // Try Microsoft auth (built-in VS Code provider — no extra extension needed)
      const session = await vscode.authentication.getSession(
        'microsoft',
        ['https://graph.microsoft.com/User.Read'],
        { createIfNone: false, silent: true }
      );

      if (session) {
        this.currentSession = session;
        console.log('Sentinel Gemini: Authenticated as', session.account.label);
        return session;
      }

      // Not signed in — in dev mode, allow bypass so the UI still loads
      console.warn(
        'Sentinel Gemini: No auth session found. Running in unauthenticated dev mode.'
      );
      return null;

    } catch (error) {
      // Auth provider timeout or unavailable — don't crash the extension
      console.error('Sentinel Gemini: Auth skipped (provider unavailable):', error);
      return null;
    }
  }

  /**
   * Prompt the user to sign in with Microsoft.
   */
  public async signIn(): Promise<vscode.AuthenticationSession | null> {
    try {
      const session = await vscode.authentication.getSession(
        'microsoft',
        ['https://graph.microsoft.com/User.Read'],
        { createIfNone: true }
      );
      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Sentinel Gemini: Sign-in failed:', error);
      vscode.window.showErrorMessage(
        'Sign-in failed. Please try again from the Sentinel Gemini panel.'
      );
      return null;
    }
  }

  /**
   * Get the current access token (null if not signed in)
   */
  public async getAccessToken(): Promise<string | null> {
    const session = await this.getGoogleSession();
    return session?.accessToken || null;
  }

  /**
   * Sign out the current user
   */
  public async signOut(): Promise<void> {
    if (this.currentSession) {
      vscode.window.showInformationMessage(
        'Please sign out from VS Code\'s account menu (bottom left)'
      );
      this.currentSession = null;
    }
  }

  /**
   * Get user info from the current session
   */
  public getUserInfo(): { email: string; name: string } | null {
    if (!this.currentSession) {
      return null;
    }
    return {
      email: this.currentSession.account.label,
      name: this.currentSession.account.label,
    };
  }
}