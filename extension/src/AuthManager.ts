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
   * Get authentication session using Google authentication provider
   */
  public async getGoogleSession(): Promise<vscode.AuthenticationSession | null> {
    try {
      // Swapped from 'microsoft' to 'google' to align with Google OAuth verification backend
      const session = await vscode.authentication.getSession(
        'google',
        ['https://www.googleapis.com/auth/userinfo.email'],
        { createIfNone: false, silent: true }
      );

      if (session) {
        this.currentSession = session;
        console.log('Sentinel Gemini: Authenticated as', session.account.label);
        return session;
      }

      console.warn('Sentinel Gemini: No auth session found. Running in unauthenticated dev mode.');
      return null;
    } catch (error) {
      console.error('Sentinel Gemini: Auth skipped (provider unavailable):', error);
      return null;
    }
  }

  /**
   * Prompt the user to sign in explicitly via Google
   */
  public async signIn(): Promise<vscode.AuthenticationSession | null> {
    try {
      const session = await vscode.authentication.getSession(
        'google',
        ['https://www.googleapis.com/auth/userinfo.email'],
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

  public async getAccessToken(): Promise<string | null> {
    const session = await this.getGoogleSession();
    return session?.accessToken || null;
  }

  public async signOut(): Promise<void> {
    if (this.currentSession) {
      vscode.window.showInformationMessage(
        'Please sign out from VS Code\'s account menu (bottom left)'
      );
      this.currentSession = null;
    }
  }

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