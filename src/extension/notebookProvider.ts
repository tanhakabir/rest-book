import { DEBUG_MODE, validateURL, NAME, MIME_TYPE } from '../common/common';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Method } from '../common/httpConstants';
import { RequestParser } from '../common/request';
import { ResponseParser, ResponseRendererElements } from '../common/response';
import { URL } from 'url';
const axios = require('axios').default;

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
    editable?: boolean;
    outputs: any | undefined;
}

interface RawCellOutput {
	mime: string;
	value: any;
}

type CancellationToken = { onCancellationRequested?: () => void };

class NotebookCellExecution {
    private static _tokenPool = 0;
	private static _tokens = new WeakMap<vscode.NotebookCell, number>();

	private readonly _token: number = NotebookCellExecution._tokenPool++;

    private readonly _startTime: number = Date.now();

    private readonly _originalRunState: vscode.NotebookCellRunState | undefined;
	readonly cts = new vscode.CancellationTokenSource();

    constructor(readonly cell: vscode.NotebookCell) {
        NotebookCellExecution._tokens.set(this.cell, this._token);
        this._originalRunState = cell.metadata.runState;
        this._replaceCell({ runState: vscode.NotebookCellRunState.Running, runStartTime: this._startTime});
    }

    private _isLatest(): boolean {
		// TODO these checks should be provided by VS Code
		return NotebookCellExecution._tokens.get(this.cell) === this._token;
	}

    private _replaceCell(meta?: any, outputs?: vscode.NotebookCellOutput[]): void {
        const edit = new vscode.WorkspaceEdit();

        if(meta) {
            edit.replaceNotebookCellMetadata(this.cell.notebook.uri, this.cell.index, this.cell.metadata.with(meta));
        }

        if(outputs) {
            edit.replaceNotebookCellOutput(this.cell.notebook.uri, this.cell.index, outputs);
        }
        
        vscode.workspace.applyEdit(edit);
    }

    cancel(): void {
        if(!this._isLatest()) { return; }

        this.cts.cancel();
        NotebookCellExecution._tokens.delete(this.cell);
        this._replaceCell({ runState: this._originalRunState });
    }

    resolve(outputs: vscode.NotebookCellOutput[], message?: string): void {
        if(!this._isLatest()) { return; }

        this._replaceCell({ 
                            executionOrder: this._token,
                            runState: vscode.NotebookCellRunState.Success,
                            lastRunDuration: Date.now() - this._startTime,
                            statusMessage: message 
                          },
                          outputs);
    }

    reject(err: any): void {
        if(!this._isLatest()) { return; }

        this._replaceCell({
                            executionOrder: this._token,
                            statusMessage: 'Error',
                            lastRunDuration: undefined,
                            runState: vscode.NotebookCellRunState.Error
                          },
                          [new vscode.NotebookCellOutput([
                                new vscode.NotebookCellOutputItem('application/x.notebook.error-traceback', {
                                    ename: err instanceof Error && err.name || 'error',
                                    evalue: err instanceof Error && err.message || JSON.stringify(err, undefined, 4),
                                    traceback: []
                                })
                           ])]);
    }

    dispose(): void {
		this.cts.dispose();
	}
}

class NotebookDocumentExecution {
    private static _tokenPool = 0;
	private static _tokens = new WeakMap<vscode.NotebookDocument, number>();

	private readonly _token: number = NotebookDocumentExecution._tokenPool++;

	private readonly _originalRunState: vscode.NotebookRunState | undefined;

	readonly cts = new vscode.CancellationTokenSource();

    constructor(readonly document: vscode.NotebookDocument) {
        NotebookDocumentExecution._tokens.set(this.document, this._token);
		this._originalRunState = document.metadata.runState;
        this._replaceDocument({ runState: vscode.NotebookRunState.Running });
    }

    private _isLatest(): boolean {
		// TODO these checks should be provided by VS Code
		return NotebookDocumentExecution._tokens.get(this.document) === this._token;
	}

    private _replaceDocument(meta: any) {
        const edit = new vscode.WorkspaceEdit();
        edit.replaceNotebookMetadata(this.document.uri, this.document.metadata.with(meta));
		vscode.workspace.applyEdit(edit);
    }

    cancel(): void {
        if(!this._isLatest()) { return; }

        this.cts.cancel();
        this._replaceDocument({ runState: this._originalRunState });
        NotebookDocumentExecution._tokens.delete(this.document);
    }

    resolve(): void {
        if(!this._isLatest()) { return; }
        this._replaceDocument({ runState: vscode.NotebookRunState.Idle });
    }

    dispose(): void {
		this.cts.dispose();
	}
}

class NotebookKernel implements vscode.NotebookKernel {
    readonly id = 'rest-book-kernel';
    readonly label = 'REST Book Kernel';
    readonly supportedLanguages = ['rest-book'];

    description?: string | undefined;
    detail?: string | undefined;
    isPreferred?: boolean | undefined;
    preloads?: vscode.Uri[] | undefined;

    private readonly _cellExecutions = new WeakMap<vscode.NotebookCell, NotebookCellExecution>();
    private readonly _documentExecutions = new WeakMap<vscode.NotebookDocument, NotebookDocumentExecution>();

    async executeCell(document: vscode.NotebookDocument, cell: vscode.NotebookCell): Promise<void> {
        this.cancelCellExecution(document, cell);

		const execution = new NotebookCellExecution(cell);
		this._cellExecutions.set(cell, execution);

		const d1 = vscode.notebook.onDidChangeNotebookCells(e => {
			if (e.document !== document) { return; }
			const didChange = e.changes.some(change => change.items.includes(cell) || change.deletedItems.includes(cell));
			if (didChange) {
				execution.cancel();
			}
		});

		const d2 = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.document === cell.document) {
				execution.cancel();
			}
		});

		try {
			return await this._doExecution(execution);
		} finally {
			d1.dispose();
			d2.dispose();
			execution.dispose();
		}
    }

    private async _doExecution(execution: NotebookCellExecution): Promise<void> {
        const doc = await vscode.workspace.openTextDocument(execution.cell.uri);

        const metadata = {
			startTime: Date.now()
		};

        const logger = (d: any, r: any) => {
            const response = new ResponseParser(d, r);

            execution.resolve([new vscode.NotebookCellOutput([
                new vscode.NotebookCellOutputItem('text/html', response.html()),
                new vscode.NotebookCellOutputItem('application/json', response.json()),
                new vscode.NotebookCellOutputItem(MIME_TYPE, response.renderer())
            ], metadata)]);
        };

        const parser = new RequestParser(doc.getText());
        let req = parser.getRequest();

        try {
            const cancelTokenAxios = axios.CancelToken.source();

            let options = {...req};
            options['cancelToken'] = cancelTokenAxios.token;

            let response = await axios(options);

            execution.cts.token.onCancellationRequested(_ => cancelTokenAxios.cancel());

            logger(response, req);
        } catch (exception) {
            logger(exception, req);
        }
        
    }

    async executeAllCells(document: vscode.NotebookDocument): Promise<void> {
        this.cancelAllCellsExecution(document);

        const execution = new NotebookDocumentExecution(document);
		this._documentExecutions.set(document, execution);

        try {
			let currentCell: vscode.NotebookCell;

			execution.cts.token.onCancellationRequested(() => this.cancelCellExecution(document, currentCell));

			for (let cell of document.cells) {
				if (cell.cellKind === vscode.NotebookCellKind.Code) {
					currentCell = cell;
					await this.executeCell(document, cell);

					if (execution.cts.token.isCancellationRequested) {
						break;
					}
				}
			}
		} finally {
			execution.resolve();
			execution.dispose();
		}
    }

    cancelCellExecution(_document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        const execution = this._cellExecutions.get(cell);
		if (execution) {
			execution.cancel();
		}
    }

    cancelAllCellsExecution(document: vscode.NotebookDocument): void {
        const execution = this._documentExecutions.get(document);
		if (execution) {
			execution.cancel();
		}
    }
    
}

export class NotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernelProvider {
    provideKernels(_document: vscode.NotebookDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookKernel[]> {
        return [new NotebookKernel()];
    }
    
    async openNotebook(uri: vscode.Uri, openContext: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData> {
        let actualUri = openContext.backupId ? vscode.Uri.parse(openContext.backupId) : uri;
		let contents = '';
		try {
			contents = Buffer.from(await vscode.workspace.fs.readFile(actualUri)).toString('utf8');
		} catch {
        }
        
        let raw: RawNotebookCell[];
        try {
            raw = <RawNotebookCell[]>JSON.parse(contents);
        } catch {
            raw = [];
        }

        const notebookData: vscode.NotebookData = {
            metadata: new vscode.NotebookDocumentMetadata().with({
                cellRunnable: true,
                cellHasExecutionOrder: true,
                displayOrder: [MIME_TYPE, 'application/json', 'text/markdown']
            }),
            cells: raw.map(item => ({
                source: item.value,
                language: item.language,
                cellKind: item.kind,
                outputs: item.outputs ?? [],
                metadata: new vscode.NotebookCellMetadata().with({ editable: item.editable ?? true, runnable: true })
            }))
        };

        return notebookData;
    }

    async resolveNotebook(_document: vscode.NotebookDocument, webview: { readonly onDidReceiveMessage: vscode.Event<any>; postMessage(message: any): Thenable<boolean>; asWebviewUri(localResource: vscode.Uri): vscode.Uri; }): Promise<void>{
        webview.onDidReceiveMessage((m) => {
            switch(m.command) {
                case 'save-response': 
                    this._saveDataToFile(m.data);
                    return;
                default: break;
            }
        });
    }
    async saveNotebook(document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void> {
        return this._save(document, document.uri);
    }
    async saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void> {
        return this._save(document, targetResource);
    }

    async _save(document: vscode.NotebookDocument, targetResource: vscode.Uri): Promise<void> {
        let contents: RawNotebookCell[] = [];

        for(const cell of document.cells) {
            contents.push({
				kind: cell.cellKind,
				language: cell.language,
				value: cell.document.getText(),
                editable: cell.metadata.editable,
                outputs: cell.outputs
			});
        }

		await vscode.workspace.fs.writeFile(targetResource, Buffer.from(JSON.stringify(contents, undefined, 2)));
	}

    async backupNotebook(document: vscode.NotebookDocument, context: vscode.NotebookDocumentBackupContext, _cancellation: vscode.CancellationToken): Promise<vscode.NotebookDocumentBackup> {
        await this._save(document, context.destination);
		return {
			id: context.destination.toString(),
			delete: () => vscode.workspace.fs.delete(context.destination)
		};
    }

    private async _saveDataToFile(data: ResponseRendererElements) {
        const workSpaceDir = path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath ?? '');
        if (!workSpaceDir) { return; }
    
        let name;
        const url = data.request?.responseUrl;
        if(url) {
            let hostname = new URL(url).hostname;
            hostname = hostname.replace(/^[A-Za-z0-9]+\./g, '');
            hostname = hostname.replace(/\.[A-Za-z0-9]+$/g, '');
            name = hostname.replace(/\./g, '-');
        } else {
            name = 'unknown-url';
        }

        let date = new Date().toDateString().replace(/\s/g, '-');
        
        const defaultPath = vscode.Uri.file(path.join(workSpaceDir, `response-${name}-${date}.json`));
        const location = await vscode.window.showSaveDialog({ defaultUri: defaultPath });
        if(!location) { return; }
    
        fs.writeFile(location?.fsPath, JSON.stringify(data, null, 4), { flag: 'w' }, (e) => {
            vscode.window.showInformationMessage(e?.message || `Saved response to ${location}`);
        });
    };
    
}