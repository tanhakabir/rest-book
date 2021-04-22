import * as vscode from 'vscode';

export function registerCommands(): vscode.Disposable {
    const subscriptions: vscode.Disposable[] = [];

    return vscode.Disposable.from(...subscriptions);
}