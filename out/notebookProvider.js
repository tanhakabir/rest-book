"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsNotebookProvider = void 0;
const child_process_1 = require("child_process");
const path_1 = require("path");
const userHome = require("user-home");
const vscode = require("vscode");
class CallsNotebookProvider {
    constructor() {
        this.label = 'PostBox: REST Calls';
        this._onDidChangeNotebook = new vscode.EventEmitter();
        this.onDidChangeNotebook = this._onDidChangeNotebook.event;
        this._localDisposables = [];
        vscode.notebook.registerNotebookKernelProvider({
            viewType: 'PostBox.restNotebook',
        }, {
            provideKernels: () => {
                return [this];
            }
        });
    }
    openNotebook(uri, openContext) {
        return __awaiter(this, void 0, void 0, function* () {
            let actualUri = openContext.backupId ? vscode.Uri.parse(openContext.backupId) : uri;
            let contents = '';
            try {
                contents = Buffer.from(yield vscode.workspace.fs.readFile(actualUri)).toString('utf8');
            }
            catch (_a) {
            }
            let raw;
            try {
                raw = JSON.parse(contents);
            }
            catch (_b) {
                raw = [];
            }
            const notebookData = {
                languages: ['javascript'],
                metadata: {
                    cellEditable: true,
                    cellRunnable: true,
                    cellHasExecutionOrder: true
                },
                cells: raw.map(item => {
                    var _a;
                    return ({
                        source: item.value,
                        language: item.language,
                        cellKind: item.kind,
                        outputs: [],
                        metadata: { editable: (_a = item.editable) !== null && _a !== void 0 ? _a : true, runnable: true }
                    });
                })
            };
            return notebookData;
        });
    }
    resolveNotebook(document, webview) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO figure out what this method is for
        });
    }
    saveNotebook(document, cancellation) {
        return this._save(document, document.uri);
    }
    saveNotebookAs(targetResource, document, cancellation) {
        return this._save(document, targetResource);
    }
    _save(document, targetResource) {
        return __awaiter(this, void 0, void 0, function* () {
            let contents = [];
            for (const cell of document.cells) {
                contents.push({
                    kind: cell.cellKind,
                    language: cell.language,
                    value: cell.document.getText(),
                    editable: cell.metadata.editable
                });
            }
            yield vscode.workspace.fs.writeFile(targetResource, Buffer.from(JSON.stringify(contents, undefined, 2)));
        });
    }
    backupNotebook(document, context, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._save(document, context.destination);
            return {
                id: context.destination.toString(),
                delete: () => vscode.workspace.fs.delete(context.destination)
            };
        });
    }
    executeCell(document, cell) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                cell.metadata.runState = vscode.NotebookCellRunState.Running;
                const start = +new Date();
                cell.metadata.runStartTime = start;
                cell.outputs = [];
                const logger = (s) => {
                    cell.outputs = [...cell.outputs, { outputKind: vscode.CellOutputKind.Text, text: s }];
                };
                yield this._performExecution(cell.document.getText(), cell, document, logger);
                cell.metadata.runState = vscode.NotebookCellRunState.Success;
                cell.metadata.lastRunDuration = +new Date() - start;
            }
            catch (e) {
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
        });
    }
    _performExecution(code, cell, document, logger) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                var _a, _b, _c;
                const command = [
                    'node',
                    ['-e', `(async () => { ${code} } )()`]
                ];
                const cwd = document.uri.scheme === 'untitled'
                    ? (_c = (_b = (_a = vscode.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri.fsPath) !== null && _c !== void 0 ? _c : userHome : path_1.dirname(document.uri.path);
                console.log(cwd);
                const execution = child_process_1.spawn(...command, { cwd });
                execution.on('error', (err) => {
                    reject(err);
                });
                execution.stdout.on('data', (data) => {
                    logger(data.toString());
                });
                execution.stderr.on('data', (data) => {
                    logger(data.toString());
                });
                execution.on('close', () => {
                    resolve(undefined);
                });
            });
        });
    }
    cancelCellExecution(document, cell) {
        //throw new Error('Method not implemented.');
    }
    executeAllCells(document) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cell of document.cells) {
                yield this.executeCell(document, cell);
            }
        });
    }
    cancelAllCellsExecution(document) {
        //throw new Error('Method not implemented.');
    }
}
exports.CallsNotebookProvider = CallsNotebookProvider;
//# sourceMappingURL=notebookProvider.js.map