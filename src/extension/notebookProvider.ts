import { DEBUG_MODE, validateURL, NAME } from '../common/common';
import * as vscode from 'vscode';
import { Method } from '../common/httpConstants';
import { RequestParser } from '../common/request';
import { ResponseParser } from '../common/response';
const axios = require('axios').default;

interface RawCell {
	language: string;
	value: string;
	kind: vscode.CellKind;
    editable?: boolean;
    outputs: any | undefined;
}

type CancellationToken = { onCancellationRequested?: () => void };

export class CallsNotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernel {
    id?: string | undefined;
    label: string = 'REST Book';
    description?: string | undefined;
    detail?: string | undefined;
    isPreferred?: boolean | undefined;
    preloads?: vscode.Uri[] | undefined;

    options?: vscode.NotebookDocumentContentOptions | undefined;
    onDidChangeNotebookContentOptions?: vscode.Event<vscode.NotebookDocumentContentOptions> | undefined;

    private _onDidChangeNotebook = new vscode.EventEmitter<vscode.NotebookDocumentEditEvent>();
    onDidChangeNotebook: vscode.Event<vscode.NotebookDocumentEditEvent> = this._onDidChangeNotebook.event;

    private cancellations = new Map<vscode.NotebookCell, CancellationToken>();

    constructor() {
        vscode.notebook.registerNotebookKernelProvider({
			viewType: 'restbook.notebook',
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
            languages: ['rest-book'],
            metadata: {
                cellRunnable: true,
                cellHasExecutionOrder: true,
                displayOrder: ['x-application/rest-book', 'application/json', 'text/markdown']
            },
            cells: raw.map(item => ({
                source: item.value,
                language: item.language,
                cellKind: item.kind,
                outputs: item.outputs ?? [],
                metadata: { editable: item.editable ?? true, runnable: true }
            }))
        };

        return notebookData;
    }

    async resolveNotebook(_document: vscode.NotebookDocument, _webview: vscode.NotebookCommunication): Promise<void> {
        // TODO figure out what this method is for
    }
    async saveNotebook(document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void> {
        return this._save(document, document.uri);
    }
    async saveNotebookAs(targetResource: vscode.Uri, document: vscode.NotebookDocument, _cancellation: vscode.CancellationToken): Promise<void> {
        return this._save(document, targetResource);
    }

    async _save(document: vscode.NotebookDocument, targetResource: vscode.Uri): Promise<void> {
        let contents: RawCell[] = [];

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
    
    async executeCell(document: vscode.NotebookDocument, cell: vscode.NotebookCell): Promise<void> {
        try {
            cell.metadata.runState = vscode.NotebookCellRunState.Running;
            const start = +new Date();
            cell.metadata.runStartTime = start;
            cell.outputs = [];
            const logger = (d: any, r: any) => {
                const response = new ResponseParser(d, r);
                cell.outputs = [...cell.outputs, { outputKind: vscode.CellOutputKind.Rich, 
                                                   data: {
                                                    "application/json": response.json(),
                                                    "text/html": response.html(),
                                                    "x-application/rest-book": response.renderer()
                                                   } 
                                                }];
            };
            const token: CancellationToken = { onCancellationRequested: undefined };
            this.cancellations.set(cell, token);
            await this._performExecution(cell, document, logger, token);
            cell.metadata.runState = vscode.NotebookCellRunState.Success;
            cell.metadata.lastRunDuration = +new Date() - start;
        } catch (e) {
            cell.outputs = [...cell.outputs,
                {
                  outputKind: vscode.CellOutputKind.Error,
                  ename: e.name,
                  evalue: e.message,
                //   traceback: [e.stack],
                  traceback: [],
                },
            ];
            cell.metadata.runState = vscode.NotebookCellRunState.Error;
            cell.metadata.lastRunDuration = undefined;
        }
        
    }

    async _performExecution( cell: vscode.NotebookCell, 
                             _document: vscode.NotebookDocument, 
                             logger: (d: any, r: any) => void,
                             token: CancellationToken): 
                             Promise<vscode.CellStreamOutput | vscode.CellErrorOutput | vscode.CellDisplayOutput | undefined | void> {

        const parser = new RequestParser(cell.document.getText());
        let req = parser.getRequest();

        try {
            const cancelTokenAxios = axios.CancelToken.source();

            let options = {...req};
            options['cancelToken'] = cancelTokenAxios.token;

            let response = await axios(options);

            token.onCancellationRequested = () => {
                cancelTokenAxios.cancel();
            };

            logger(response, req);
        } catch (exception) {
            logger(exception, req);
        }
    }

    cancelCellExecution(_document: vscode.NotebookDocument, cell: vscode.NotebookCell): void {
        this.cancellations.get(cell)?.onCancellationRequested?.();
    }
    async executeAllCells(document: vscode.NotebookDocument): Promise<void> {
        for (const cell of document.cells) {
            await this.executeCell(document, cell);
        }
    }
    cancelAllCellsExecution(document: vscode.NotebookDocument): void {
        for (const cell of document.cells) {
            this.cancellations.get(cell)?.onCancellationRequested?.();
        }
    }
    
}