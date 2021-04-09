import * as vscode from 'vscode';
export declare class NotebookProvider implements vscode.NotebookSerializer, vscode.NotebookKernelProvider {
    dataToNotebook(data: Uint8Array): Promise<vscode.NotebookData>;
    notebookToData(data: vscode.NotebookData): Promise<Uint8Array>;
    provideKernels(_document: vscode.NotebookDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookKernel[]>;
    resolveNotebook(_document: vscode.NotebookDocument, webview: {
        readonly onDidReceiveMessage: vscode.Event<any>;
        postMessage(message: any): Thenable<boolean>;
        asWebviewUri(localResource: vscode.Uri): vscode.Uri;
    }): Promise<void>;
    private _saveDataToFile;
}
