import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';
import { insertCodeCommand } from './commands/insertCode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Sentinel Gemini extension is now active');

  // Register the sidebar provider
  const sidebarProvider = new SidebarProvider(context.extensionUri, context);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'sentinel-gemini.chatView',
      sidebarProvider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'sentinel-gemini.insertCode',
      insertCodeCommand
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'sentinel-gemini.clearChat',
      () => {
        vscode.window.showInformationMessage('Chat cleared (refresh the view)');
      }
    )
  );

  // Show welcome message
  vscode.window.showInformationMessage(
    'Sentinel Gemini is ready! Open the sidebar to start chatting.'
  );
}

export function deactivate() {
  console.log('Sentinel Gemini extension is now deactivated');
}