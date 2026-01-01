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
   * Get Google authentication session
   * This will prompt the user to sign in if they haven't already
   */
  public async getGoogleSession(): Promise<vscode.AuthenticationSession | null> {
    try {
      // Check for existing session first
      const sessions = await vscode.authentication.getSession(
        'google',
        ['email', 'profile', 'openid'],
        { createIfNone: false }
      );

      if (sessions) {
        this.currentSession = sessions;
        return sessions;
      }

      // No existing session, create a new one
      const session = await vscode.authentication.getSession(
        'google',
        ['email', 'profile', 'openid'],
        { createIfNone: true }
      );

      this.currentSession = session;
      return session;
    } catch (error) {
      console.error('Authentication error:', error);
      vscode.window.showErrorMessage(
        'Failed to authenticate with Google. Please try again.'
      );
      return null;
    }
  }

  /**
   * Get the current access token
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
      // Note: VS Code doesn't provide a direct signOut API
      // Users must sign out from VS Code's account menu
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