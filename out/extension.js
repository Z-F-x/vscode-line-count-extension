"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
let statusBarItem;
function activate(context) {
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(getAlignment(), getStatusBarPriority());
    // Update on startup
    updateLineCount();
    // Update when active editor changes
    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
        updateLineCount();
    }));
    // Update when document content changes
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document === vscode.window.activeTextEditor?.document) {
            updateLineCount();
        }
    }));
    // Update when configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("lineCount")) {
            // Recreate status bar item with new settings
            statusBarItem.dispose();
            statusBarItem = vscode.window.createStatusBarItem(getAlignment(), getStatusBarPriority());
            updateLineCount();
        }
    }));
    // Add to subscriptions for cleanup
    context.subscriptions.push(statusBarItem);
}
exports.activate = activate;
function updateLineCount() {
    const config = vscode.workspace.getConfiguration("lineCount");
    const showInStatusBar = config.get("showInStatusBar", true);
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
    const format = config.get("format", "Lines: $(symbol-number) {count}");
    const text = format.replace("{count}", lineCount.toString());
    statusBarItem.text = text;
    statusBarItem.tooltip = `Total lines in ${document.fileName
        .split(/[\\/]/)
        .pop()}: ${lineCount}`;
    statusBarItem.show();
}
function getAlignment() {
    const config = vscode.workspace.getConfiguration("lineCount");
    const alignment = config.get("alignment", "left");
    return alignment === "right"
        ? vscode.StatusBarAlignment.Right
        : vscode.StatusBarAlignment.Left;
}
function getStatusBarPriority() {
    const config = vscode.workspace.getConfiguration("lineCount");
    return config.get("priority", 100);
}
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map