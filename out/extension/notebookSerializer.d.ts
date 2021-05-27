import * as vscode from 'vscode';
export declare class NotebookSerializer implements vscode.NotebookSerializer {
    deserializeNotebook(content: Uint8Array, _token: vscode.CancellationToken): Promise<vscode.NotebookData>;
    serializeNotebook(data: vscode.NotebookData, _token: vscode.CancellationToken): Promise<Uint8Array>;
}
