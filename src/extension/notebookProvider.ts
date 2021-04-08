import { DEBUG_MODE, NAME, MIME_TYPE } from '../common/common';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TextDecoder, TextEncoder } from "util";
import { Method } from '../common/httpConstants';
import { RequestParser } from '../common/request';
import { ResponseParser, ResponseRendererElements } from '../common/response';
import { Url } from 'url';
const axios = require('axios').default;

interface RawNotebookCell {
	language: string;
	value: string;
	kind: vscode.NotebookCellKind;
    editable?: boolean;
    outputs: RawCellOutput[];
}

interface RawCellOutput {
	mime: string;
	value: any;
}

class NotebookKernel implements vscode.NotebookKernel {
    readonly id = 'rest-book-kernel';
    readonly label = 'REST Book Kernel';
    readonly supportedLanguages = ['rest-book'];

    description?: string | undefined;
    detail?: string | undefined;
    isPreferred?: boolean | undefined;
    preloads?: vscode.Uri[] | undefined;

    private _executionOrder = 0;


    async executeCellsRequest(document: vscode.NotebookDocument, ranges: vscode.NotebookCellRange[]): Promise<void> {
        for(let range of ranges) {
            for(let cell of document.getCells(range)) {
                const execution = vscode.notebook.createNotebookCellExecutionTask(cell.notebook.uri, cell.index, this.id)!;
			    await this._doExecution(execution);
            }
        }
    }

    private async _doExecution(execution: vscode.NotebookCellExecutionTask): Promise<void> {
        const doc = await vscode.workspace.openTextDocument(execution.cell.document.uri);

        execution.executionOrder = ++this._executionOrder;
		execution.start({ startTime: Date.now() });

        const metadata = {
			startTime: Date.now()
		};

        const logger = (d: any, r: any) => {
            try {
                const response = new ResponseParser(d, r);

                execution.replaceOutput([new vscode.NotebookCellOutput([
                    new vscode.NotebookCellOutputItem(MIME_TYPE, response.renderer()),
                    new vscode.NotebookCellOutputItem('application/json', response.json()),
                    new vscode.NotebookCellOutputItem('text/html', response.html())
                ], metadata)]);
        
                execution.end({ success: true });
            } catch (_) {
                execution.replaceOutput([new vscode.NotebookCellOutput([
                    new vscode.NotebookCellOutputItem('application/x.notebook.error-traceback', {
                        ename: d instanceof Error && d.name || 'error',
                        evalue: d instanceof Error && d.message || JSON.stringify(d, undefined, 4),
                        traceback: []
                    })
                ])]);
                execution.end({ success: false });
            }
        };

        let req;
        
        try {
            const parser = new RequestParser(doc.getText());
            req = parser.getRequest();
        } catch (err) {
            execution.replaceOutput([new vscode.NotebookCellOutput([
                new vscode.NotebookCellOutputItem('application/x.notebook.error-traceback', {
                    ename: err instanceof Error && err.name || 'error',
                    evalue: err instanceof Error && err.message || JSON.stringify(err, undefined, 4),
                    traceback: []
                })
            ])]);
            execution.end({ success: false });
            return;
        }

        try {
            const cancelTokenAxios = axios.CancelToken.source();

            let options = {...req};
            options['cancelToken'] = cancelTokenAxios.token;

            execution.token.onCancellationRequested(_ => cancelTokenAxios.cancel());

            let response = await axios(options);

            logger(response, req);
        } catch (exception) {
            logger(exception, req);
        }
        
    }
    
}

export class NotebookProvider implements vscode.NotebookContentProvider, vscode.NotebookKernelProvider {
    provideKernels(_document: vscode.NotebookDocument, _token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookKernel[]> {
        return [new NotebookKernel()];
    }
    
    async openNotebook(uri: vscode.Uri, context: vscode.NotebookDocumentOpenContext): Promise<vscode.NotebookData> {
        let actualUri = context.backupId ? vscode.Uri.parse(context.backupId) : uri;
		let contents = '';
		try {
			contents = new TextDecoder().decode(await vscode.workspace.fs.readFile(actualUri));
		} catch {
		}

		let raw: RawNotebookCell[];
		try {
			raw = <RawNotebookCell[]>JSON.parse(contents);
		} catch {
			raw = [];
		}

        const cells = raw.map(item => new vscode.NotebookCellData(
			item.kind,
			item.value,
			item.language,
			item.outputs ? [new vscode.NotebookCellOutput(item.outputs.map(raw => new vscode.NotebookCellOutputItem(raw.mime, raw.value)))] : [],
			new vscode.NotebookCellMetadata().with({ editable: item.editable ?? true })
		));

        return new vscode.NotebookData(
			cells,
			new vscode.NotebookDocumentMetadata().with({ cellHasExecutionOrder: true, })
		);
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
        function asRawOutput(cell: vscode.NotebookCell): RawCellOutput[] {
			let result: RawCellOutput[] = [];
			for (let output of cell.outputs) {
				for (let item of output.outputs) {
					result.push({ mime: item.mime, value: item.value });
				}
			}
			return result;
		}

        let contents: RawNotebookCell[] = [];

        for(const cell of document.getCells()) {
            contents.push({
				kind: cell.kind,
				language: cell.document.languageId,
				value: cell.document.getText(),
                editable: cell.metadata.editable,
                outputs: asRawOutput(cell)
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
            let hostname = new Url(url).hostname ?? '';
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