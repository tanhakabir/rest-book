import * as vscode from 'vscode';

export class CallsNotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernel {
    options?: vscode.NotebookDocumentContentOptions | undefined;
    onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;
    
    private _onDidChangeNotebook = new vscode.EventEmitter<vscode.NotebookDocumentEditEvent>();
    onDidChangeNotebook: vscode.Event<vscode.NotebookDocumentEditEvent> = this._onDidChangeNotebook.event;
    
    openNotebook(uri: vscode.Uri, openContext: vscode.NotebookDocumentOpenContext): vscode.NotebookData | Promise<vscode.NotebookData> {
        throw new Error('Method not implemented.');
    }
    resolveNotebook(document: vscode.NotebookDocument, webview: vscode.NotebookCommunication): Promise<void> {
        throw new Error('Method not implemented.');
    }
    saveNotebook(document: vscode.NotebookDocument, cancellation: vscode.CancellationToken): Promise<void> {
        throw new Error('Method not implemented.');
    }
    saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument, cancellation: vscode.CancellationToken): Promise<void> {
        throw new Error('Method not implemented.');
    }
    backupNotebook(document: vscode.NotebookDocument, context: vscode.NotebookDocumentBackupContext, cancellation: vscode.CancellationToken): Promise<vscode.NotebookDocumentBackup> {
        throw new Error('Method not implemented.');
    }
    id?: string | undefined;
    label: string = 'PostBox: REST Calls';
    description?: string | undefined;
    detail?: string | undefined;
    isPreferred?: boolean | undefined;
    preloads?: vscode.Uri[] | undefined;
    executeCell(document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        throw new Error('Method not implemented.');
    }
    cancelCellExecution(document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        throw new Error('Method not implemented.');
    }
    executeAllCells(document: vscode.NotebookDocument): void {
        throw new Error('Method not implemented.');
    }
    cancelAllCellsExecution(document: vscode.NotebookDocument): void {
        throw new Error('Method not implemented.');
    }
    
}