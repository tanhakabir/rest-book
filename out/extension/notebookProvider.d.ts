import * as vscode from 'vscode';
declare type CancellationToken = {
    onCancellationRequested?: () => void;
};
export declare class CallsNotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernel {
    id?: string | undefined;
    label: string;
    description?: string | undefined;
    detail?: string | undefined;
    isPreferred?: boolean | undefined;
    preloads?: vscode.Uri[] | undefined;
    options?: vscode.NotebookDocumentContentOptions | undefined;
    onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;
    private _onDidChangeNotebook;
    onDidChangeNotebook: vscode.Event<vscode.NotebookDocumentEditEvent>;
    private cancellations;
    constructor();
    openNotebook(uri: vscode.Uri, openContext: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData>;
    resolveNotebook(_document: vscode.NotebookDocument, _webview: vscode.NotebookCommunication): Promise<void>;
    saveNotebook(document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void>;
    saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void>;
    _save(document: vscode.NotebookDocument, targetResource: vscode.Uri): Promise<void>;
    backupNotebook(document: vscode.NotebookDocument, context: vscode.NotebookDocumentBackupContext, _cancellation: vscode.CancellationToken): Promise<vscode.NotebookDocumentBackup>;
    executeCell(document: vscode.NotebookDocument, cell: vscode.NotebookCell): Promise<void>;
    _performExecution(cell: vscode.NotebookCell, _document: vscode.NotebookDocument, logger: (d: any, r: any) => void, token: CancellationToken): Promise<vscode.CellStreamOutput | vscode.CellErrorOutput | vscode.CellDisplayOutput | undefined | void>;
    cancelCellExecution(_document: vscode.NotebookDocument, cell: vscode.NotebookCell): void;
    executeAllCells(document: vscode.NotebookDocument): Promise<void>;
    cancelAllCellsExecution(document: vscode.NotebookDocument): void;
}
export {};
