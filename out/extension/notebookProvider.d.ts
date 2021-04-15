import * as vscode from 'vscode';
export declare class NotebookKernel {
    readonly id = "rest-book-kernel";
    readonly label = "REST Book Kernel";
    readonly supportedLanguages: string[];
    private readonly _controller;
    private _executionOrder;
    constructor();
    dispose(): void;
    private _executeAll;
    executeCellsRequest(document: vscode.NotebookDocument, ranges: vscode.NotebookCellRange[]): Promise<void>;
    private _doExecution;
}
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
