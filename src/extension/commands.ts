import * as vscode from 'vscode';
import * as path from 'path';

export function registerCommands(): vscode.Disposable {
    let disposables: vscode.Disposable[] = [];

    disposables.push(vscode.commands.registerCommand('rest-book.newNotebook', () => {
        const workSpaceDir = path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath ?? '');
        if (!workSpaceDir) { return; }

        let untitledFile = vscode.Uri.file(path.join(workSpaceDir, 'untitled.restbook'));
        untitledFile.with({ scheme: 'untitled' });
        vscode.workspace.openTextDocument(untitledFile).then(file => {
            vscode.window.showTextDocument(file);
        });
    }));

    return vscode.Disposable.from(...disposables);
}