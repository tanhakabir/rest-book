import { DEBUG_MODE, validateURL } from './common';
import * as vscode from 'vscode';
const axios = require('axios').default;

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
        vscode.notebook.registerNotebookKernelProvider({
			viewType: 'PostBox.restNotebook',
		}, {
			provideKernels: () => {
				return [this];
			}
		});
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
            languages: ['PostBox'],
            metadata: {
                cellRunnable: true,
                cellHasExecutionOrder: true,
                displayOrder: ['x-application/PostBox', 'application/json', 'text/markdown']
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

        for(const cell of document.cells) {
            contents.push({
				kind: cell.cellKind,
				language: cell.language,
				value: cell.document.getText(),
				editable: cell.metadata.editable
			});
        }

		await vscode.workspace.fs.writeFile(targetResource, Buffer.from(JSON.stringify(contents, undefined, 2)));
	}

    async backupNotebook(document: vscode.NotebookDocument, context: vscode.NotebookDocumentBackupContext, cancellation: vscode.CancellationToken): Promise<vscode.NotebookDocumentBackup> {
        await this._save(document, context.destination);
		return {
			id: context.destination.toString(),
			delete: () => vscode.workspace.fs.delete(context.destination)
		};
    }
    
    async executeCell(document: vscode.NotebookDocument, cell: vscode.NotebookCell): Promise<void> {
        try {
            cell.metadata.runState = vscode.NotebookCellRunState.Running;
            const start = +new Date();
            cell.metadata.runStartTime = start;
            cell.outputs = [];
            const logger = (d: any) => {
                console.log(d);

                let display = {
                    "application/json": {
                        status: d.status,
                        statusText: d.statusText,
                        headers: {
                            date: d.headers.date,
                            expires: d.headers.expires,
                            "cache-control": d.headers["cache-control"],
                            "content-type": d.headers["content-type"],
                            p3p: d.headers.p3p,
                            server: d.headers.server,
                            "x-xss-protection": d.headers["x-xss-protection"],
                            "x-frame-options": d.headers["x-frame-option"],
                            "set-cookie": d.headers["set-cookie"],
                            connection: d.headers.connection,
                            "transfer-encoding": d.headers["transfer-encoding"]
                        },
                        data: d.data
                    }
                };

                try {
                cell.outputs = [...cell.outputs, { outputKind: vscode.CellOutputKind.Rich, data: display }];
                } catch (err) {
                    console.log(err);
                }
            };
            await this._performExecution(cell, document, logger);
            cell.metadata.runState = vscode.NotebookCellRunState.Success;
            cell.metadata.lastRunDuration = +new Date() - start;
        } catch (e) {
            cell.outputs = [...cell.outputs,
                {
                  outputKind: vscode.CellOutputKind.Error,
                  ename: e.name,
                  evalue: e.message,
                  traceback: [e.stack],
                },
            ];
            cell.metadata.runState = vscode.NotebookCellRunState.Error;
            cell.metadata.lastRunDuration = undefined;
        }
        
    }

    async _performExecution( cell: vscode.NotebookCell, 
                             document: vscode.NotebookDocument, 
                             logger: (s: string) => void): 
                             Promise<vscode.CellStreamOutput | vscode.CellErrorOutput | vscode.CellDisplayOutput | undefined> {
        const query = cell.document.getText();

        if (!validateURL(query)) {
            return Promise.reject('Not a valid URL.');
        }

        try {
            let response = await axios.get(query);
            logger(response);
        } catch (exception) {
            logger(exception);
        }
    }

    cancelCellExecution(document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        //throw new Error('Method not implemented.');
    }
    async executeAllCells(document: vscode.NotebookDocument): Promise<void> {
        for (const cell of document.cells) {
            await this.executeCell(document, cell);
        }
    }
    cancelAllCellsExecution(document: vscode.NotebookDocument): void {
        //throw new Error('Method not implemented.');
    }
    
}