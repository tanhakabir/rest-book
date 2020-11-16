import { spawn } from 'child_process';
import { createCipher } from 'crypto';
import { dirname } from 'path';
import * as userHome from 'user-home';
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
            const logger = (s: string) => {
                cell.outputs = [...cell.outputs, { outputKind: vscode.CellOutputKind.Text, text: s }];
            };
            await this._performExecution(cell.document.getText(), cell, document, logger);
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

    async _performExecution( code: string, 
                             cell: vscode.NotebookCell, 
                             document: vscode.NotebookDocument, 
                             logger: (s: string) => void): 
                             Promise<vscode.CellStreamOutput | vscode.CellErrorOutput | vscode.CellDisplayOutput | undefined> {

        return new Promise((resolve, reject) => {
            const command = [
                'node',
                ['-e', `(async () => { ${code} } )()`]
            ];
    
            const cwd = document.uri.scheme === 'untitled'
                ? vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? userHome : dirname(document.uri.path);
            console.log(cwd);

            const execution = spawn(...command, { cwd });

            execution.on('error', (err) => {
                reject(err);
            });
        
            execution.stdout.on('data', (data: Buffer) => {
                logger(data.toString());
            });
        
            execution.stderr.on('data', (data: Buffer) => {
                logger(data.toString());
            });
        
            execution.on('close', () => {
                resolve(undefined);
            });
        });
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