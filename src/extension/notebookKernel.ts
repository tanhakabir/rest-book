import { DEBUG_MODE, NAME, MIME_TYPE } from '../common/common';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Method } from '../common/httpConstants';
import { RequestParser } from '../common/request';
import { ResponseParser, ResponseRendererElements } from '../common/response';
import { updateCache } from '../common/cache';
const axios = require('axios').default;
var stringify = require('json-stringify-safe');

export class NotebookKernel {
    readonly id: string = 'ml-feed-kernel';
    readonly notebookType: string = 'ml-feed';
    readonly label: string = 'ML feed';
    readonly supportedLanguages = ['ml-feed'];

    private readonly _controller: vscode.NotebookController;
	private _executionOrder = 0;

	constructor(isInteractive?: boolean) {
        if (isInteractive) {
            this.id = 'ml-feed-interactive-kernel';
            this.notebookType = 'interactive';
        }
        this._controller = vscode.notebooks.createNotebookController(this.id, 
                                                                    this.notebookType, 
                                                                    this.label);

		this._controller.supportedLanguages = ['ml-feed'];
		this._controller.supportsExecutionOrder = true;
		this._controller.description = 'A notebook for making REST calls.';
		this._controller.executeHandler = this._execute.bind(this);
	}

	dispose(): void {
		this._controller.dispose();
	}

    private _execute(
        cells: vscode.NotebookCell[],
        _notebook: vscode.NotebookDocument,
        _controller: vscode.NotebookController
      ): void {
        for (let cell of cells) {
          this._doExecution(cell);
        }
      }
    
      private async _doExecution(cell: vscode.NotebookCell): Promise<void> {
        const execution = this._controller.createNotebookCellExecution(cell);
        execution.executionOrder = ++this._executionOrder;
        execution.start(Date.now()); // Keep track of elapsed time to execute cell.
    
        /* Do some execution here; not implemented */
    
        execution.replaceOutput([
          new vscode.NotebookCellOutput([
            vscode.NotebookCellOutputItem.text( 'abc')
          ])
        ]);
        //await this.comby();
        execution.end(true, Date.now());
      }

    private async _saveDataToFile(data: ResponseRendererElements) {
        const workSpaceDir = path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath ?? '');
        if (!workSpaceDir) { return; }
    
        let name;
        const url = data.request?.responseUrl;
        if(url) {
            name = url;
            name = name.replace(/^[A-Za-z0-9]+\./g, '');
            name = name.replace(/\.[A-Za-z0-9]+$/g, '');
            name = name.replace(/\.\:\//g, '-');
        } else {
            name = 'unknown-url';
        }

        let date = new Date().toDateString().replace(/\s/g, '-');
        
        const defaultPath = vscode.Uri.file(path.join(workSpaceDir, `response-${name}-${date}.json`));
        const location = await vscode.window.showSaveDialog({ defaultUri: defaultPath });
        if(!location) { return; }
    
        fs.writeFile(location?.fsPath, stringify(data, null, 4), { flag: 'w' }, (e) => {
            vscode.window.showInformationMessage(e?.message || `Saved response to ${location}`);
        });
    };


    
}
