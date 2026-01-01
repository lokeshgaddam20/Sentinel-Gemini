import * as vscode from 'vscode';
import { AuthManager } from './AuthManager';
import * as path from 'path';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private _authManager: AuthManager;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {
    this._authManager = AuthManager.getInstance();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media')
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'INSERT_CODE': {
          if (data.code) {
            await this._insertCodeAtCursor(data.code);
          }
          break;
        }
      }
    });

    // When the view becomes visible, send the auth token
    webviewView.onDidChangeVisibility(async () => {
      if (webviewView.visible) {
        await this._sendAuthToken();
      }
    });

    // Send auth token immediately
    this._sendAuthToken();
  }

  private async _sendAuthToken() {
    if (!this._view) {
      return;
    }

    try {
      const token = await this._authManager.getAccessToken();
      
      if (token) {
        this._view.webview.postMessage({
          type: 'AUTH_TOKEN',
          value: token,
        });
      } else {
        this._view.webview.postMessage({
          type: 'ERROR',
          value: 'Failed to authenticate. Please sign in to Google.',
        });
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
      this._view.webview.postMessage({
        type: 'ERROR',
        value: 'Authentication error. Please try reloading the window.',
      });
    }
  }

  private async _insertCodeAtCursor(code: string) {
    const editor = vscode.window.activeTextEditor;
    
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found');
      return;
    }

    await editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, code);
    });

    vscode.window.showInformationMessage('Code inserted successfully');
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    // Get URIs for the built React app
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'assets', 'main.js')
    );
    
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, 'media', 'assets', 'main.css')
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = this._getNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'none'; 
                 style-src ${webview.cspSource} 'unsafe-inline'; 
                 script-src 'nonce-${nonce}';
                 connect-src http://localhost:8000 https://*.googleapis.com;
                 img-src ${webview.cspSource} https: data:;
                 font-src ${webview.cspSource};">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="${styleUri}" rel="stylesheet">
  <title>Sentinel Gemini</title>
</head>
<body>
  <div id="root"></div>
  <script nonce="${nonce}" type="module" src="${scriptUri}"></script>
</body>
</html>`;
  }

  private _getNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
}