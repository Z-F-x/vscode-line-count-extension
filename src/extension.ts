import * as vscode from "vscode";

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    getAlignment(),
    getStatusBarPriority()
  );

  // Update on startup
  updateLineCount();

  // Update when active editor changes
  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      updateLineCount();
    })
  );

  // Update when document content changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(
      (event: vscode.TextDocumentChangeEvent) => {
        if (event.document === vscode.window.activeTextEditor?.document) {
          updateLineCount();
        }
      }
    )
  );

  // Update when configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(
      (event: vscode.ConfigurationChangeEvent) => {
        if (event.affectsConfiguration("lineCount")) {
          // Recreate status bar item with new settings
          statusBarItem.dispose();
          statusBarItem = vscode.window.createStatusBarItem(
            getAlignment(),
            getStatusBarPriority()
          );
          updateLineCount();
        }
      }
    )
  );

  // Add to subscriptions for cleanup
  context.subscriptions.push(statusBarItem);
}

function updateLineCount() {
  const config = vscode.workspace.getConfiguration("lineCount");
  const showInStatusBar = config.get<boolean>("showInStatusBar", true);

  if (!showInStatusBar) {
    statusBarItem.hide();
    return;
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    statusBarItem.hide();
    return;
  }

  const document = editor.document;
  const lineCount = document.lineCount;

  // Get format from configuration
  const format = config.get<string>(
    "format",
    "Lines: $(symbol-number) {count}"
  );
  const text = format.replace("{count}", lineCount.toString());

  statusBarItem.text = text;
  statusBarItem.tooltip = `Total lines in ${document.fileName
    .split(/[\\/]/)
    .pop()}: ${lineCount}`;
  statusBarItem.show();
}

function getAlignment(): vscode.StatusBarAlignment {
  const config = vscode.workspace.getConfiguration("lineCount");
  const alignment = config.get<string>("alignment", "left");
  return alignment === "right"
    ? vscode.StatusBarAlignment.Right
    : vscode.StatusBarAlignment.Left;
}

function getStatusBarPriority(): number {
  const config = vscode.workspace.getConfiguration("lineCount");
  return config.get<number>("priority", 100);
}

export function deactivate() {
  if (statusBarItem) {
    statusBarItem.dispose();
  }
}
