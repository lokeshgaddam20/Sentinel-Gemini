/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vscode-bg': 'var(--vscode-editor-background)',
        'vscode-sidebar': 'var(--vscode-sideBar-background)',
        'vscode-input': 'var(--vscode-input-background)',
        'vscode-button': 'var(--vscode-button-background)',
        'vscode-button-hover': 'var(--vscode-button-hoverBackground)',
        'vscode-foreground': 'var(--vscode-foreground)',
        'vscode-border': 'var(--vscode-panel-border)',
        'vscode-focus': 'var(--vscode-focusBorder)',
      },
    },
  },
  plugins: [],
}