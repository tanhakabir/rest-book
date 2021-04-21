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
    private _doExecution;
    private _handleMessage;
    private _saveDataToFile;
}
export declare class NotebookSerializer implements vscode.NotebookSerializer {
    deserializeNotebook(content: Uint8Array, _token: vscode.CancellationToken): Promise<vscode.NotebookData>;
    serializeNotebook(data: vscode.NotebookData, _token: vscode.CancellationToken): Promise<Uint8Array>;
}
