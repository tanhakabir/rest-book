import * as vscode from 'vscode';

interface RawCell {
	language: string;
	value: string;
	kind: vscode.CellKind;
	editable?: boolean;
}

export class CallsNotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernel {
    id?: string | undefined;
    label: string = 'PostBox: REST Calls';
    description?: string | undefined;
    detail?: string | undefined;
    isPreferred?: boolean | undefined;
    preloads?: vscode.Uri[] | undefined;

    options?: vscode.NotebookDocumentContentOptions | undefined;
    onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;

    private _onDidChangeNotebook = new vscode.EventEmitter<vscode.NotebookDocumentEditEvent>();
    onDidChangeNotebook: vscode.Event<vscode.NotebookDocumentEditEvent> = this._onDidChangeNotebook.event;


    private _localDisposables: vscode.Disposable[] = [];

    constructor() {

	}
    
    async openNotebook(uri: vscode.Uri, openContext: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData> {
        let actualUri = openContext.backupId ? vscode.Uri.parse(openContext.backupId) : uri;
		let contents = '';
		try {
			contents = Buffer.from(await vscode.workspace.fs.readFile(actualUri)).toString('utf8');
		} catch {
        }
        
        let raw: RawCell[];
        try {
            raw = <RawCell[]>JSON.parse(contents);
        } catch {
            raw = [];
        }

        const notebookData: vscode.NotebookData = {
            languages: ['javascript'],
            metadata: {
                cellEditable: true,
                cellRunnable: true,
                cellHasExecutionOrder: true
            },
            cells: raw.map(item => ({
                source: item.value,
                language: item.language,
                cellKind: item.kind,
                outputs: [],
                metadata: { editable: item.editable ?? true, runnable: true }
            }))
        };

        return notebookData;
    }

    async resolveNotebook(document: vscode.NotebookDocument, webview: vscode.NotebookCommunication): Promise<void> {
        // TODO figure out what this method is for
    }
    saveNotebook(document: vscode.NotebookDocument, cancellation: vscode.CancellationToken): Promise<void> {
        return this._save(document, document.uri);
    }
    saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument, cancellation: vscode.CancellationToken): Promise<void> {
        return this._save(document, targetResource);
    }

    async _save(document: vscode.NotebookDocument, targetResource: vscode.Uri): Promise<void> {
        let contents: RawCell[] = [];

        document.cells.map(cell => {
            contents.push({
				kind: cell.cellKind,
				language: cell.language,
				value: cell.document.getText(),
				editable: cell.metadata.editable
			});
        });

		await vscode.workspace.fs.writeFile(targetResource, Buffer.from(JSON.stringify(contents, undefined, 2)));
	}

    async backupNotebook(document: vscode.NotebookDocument, context: vscode.NotebookDocumentBackupContext, cancellation: vscode.CancellationToken): Promise<vscode.NotebookDocumentBackup> {
        await this._save(document, context.destination);
		return {
			id: context.destination.toString(),
			delete: () => vscode.workspace.fs.delete(context.destination)
		};
    }
    
    executeCell(document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        //throw new Error('Method not implemented.');
    }
    cancelCellExecution(document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        //throw new Error('Method not implemented.');
    }
    executeAllCells(document: vscode.NotebookDocument): void {
        //throw new Error('Method not implemented.');
    }
    cancelAllCellsExecution(document: vscode.NotebookDocument): void {
        //throw new Error('Method not implemented.');
    }
    
}