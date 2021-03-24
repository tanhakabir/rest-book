import * as vscode from 'vscode';
export declare class NotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernelProvider {
    provideKernels(_document: vscode.NotebookDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookKernel[]>;
    openNotebook(uri: vscode.Uri, context: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData>;
    resolveNotebook(_document: vscode.NotebookDocument, webview: {
        readonly onDidReceiveMessage: vscode.Event<any>;
        postMessage(message: any): Thenable<boolean>;
        asWebviewUri(localResource: vscode.Uri): vscode.Uri;
    }): Promise<void>;
    saveNotebook(document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void>;
    saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void>;
    _save(document: vscode.NotebookDocument, targetResource: vscode.Uri): Promise<void>;
    backupNotebook(document: vscode.NotebookDocument, context: vscode.NotebookDocumentBackupContext, _cancellation: vscode.CancellationToken): Promise<vscode.NotebookDocumentBackup>;
    private _saveDataToFile;
}
