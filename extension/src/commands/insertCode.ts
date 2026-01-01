import * as vscode from 'vscode';

/**
 * Command to insert code at the current cursor position
 */
export async function insertCodeCommand(code?: string) {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    vscode.window.showWarningMessage('No active editor found');
    return;
  }

  // If no code provided, prompt the user
  if (!code) {
    code = await vscode.window.showInputBox({
      prompt: 'Enter code to insert',
      placeHolder: 'console.log("Hello World");',
    });
  }

  if (!code) {
    return;
  }

  await editor.edit((editBuilder) => {
    editBuilder.insert(editor.selection.active, code);
  });

  vscode.window.showInformationMessage('Code inserted successfully');
}