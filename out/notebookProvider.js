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
const vscode = require("vscode");
const parser_1 = require("./parser");
const response_1 = require("./response");
const axios = require('axios').default;
class CallsNotebookProvider {
    constructor() {
        this.label = 'REST Book';
        this._onDidChangeNotebook = new vscode.EventEmitter();
        this.onDidChangeNotebook = this._onDidChangeNotebook.event;
        this.cancellations = new Map();
        vscode.notebook.registerNotebookKernelProvider({
            viewType: 'restbook.notebook',
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
                languages: ['rest-book'],
                metadata: {
                    cellRunnable: true,
                    cellHasExecutionOrder: true,
                    displayOrder: ['x-application/rest-book', 'text/markdown']
                },
                cells: raw.map(item => {
                    var _a, _b;
                    return ({
                        source: item.value,
                        language: item.language,
                        cellKind: item.kind,
                        outputs: (_a = item.outputs) !== null && _a !== void 0 ? _a : [],
                        metadata: { editable: (_b = item.editable) !== null && _b !== void 0 ? _b : true, runnable: true }
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
        return __awaiter(this, void 0, void 0, function* () {
            return this._save(document, document.uri);
        });
    }
    saveNotebookAs(targetResource, document, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._save(document, targetResource);
        });
    }
    _save(document, targetResource) {
        return __awaiter(this, void 0, void 0, function* () {
            let contents = [];
            for (const cell of document.cells) {
                contents.push({
                    kind: cell.cellKind,
                    language: cell.language,
                    value: cell.document.getText(),
                    editable: cell.metadata.editable,
                    outputs: cell.outputs
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
                const logger = (d) => {
                    cell.outputs = [...cell.outputs, { outputKind: vscode.CellOutputKind.Rich, data: new response_1.Response(d).parse() }];
                };
                const token = { onCancellationRequested: undefined };
                this.cancellations.set(cell, token);
                yield this._performExecution(cell, document, logger, token);
                cell.metadata.runState = vscode.NotebookCellRunState.Success;
                cell.metadata.lastRunDuration = +new Date() - start;
            }
            catch (e) {
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
        });
    }
    _performExecution(cell, document, logger, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const parser = new parser_1.Parser(cell, document);
            try {
                const cancelTokenAxios = axios.CancelToken.source();
                let options = parser.getAxiosOptions();
                options['cancelToken'] = cancelTokenAxios.token;
                let response = yield axios(options);
                token.onCancellationRequested = () => {
                    cancelTokenAxios.cancel();
                };
                logger(response);
            }
            catch (exception) {
                logger(exception);
            }
        });
    }
    cancelCellExecution(document, cell) {
        var _a, _b;
        (_b = (_a = this.cancellations.get(cell)) === null || _a === void 0 ? void 0 : _a.onCancellationRequested) === null || _b === void 0 ? void 0 : _b.call(_a);
    }
    executeAllCells(document) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const cell of document.cells) {
                yield this.executeCell(document, cell);
            }
        });
    }
    cancelAllCellsExecution(document) {
        var _a, _b;
        for (const cell of document.cells) {
            (_b = (_a = this.cancellations.get(cell)) === null || _a === void 0 ? void 0 : _a.onCancellationRequested) === null || _b === void 0 ? void 0 : _b.call(_a);
        }
    }
}
exports.CallsNotebookProvider = CallsNotebookProvider;
//# sourceMappingURL=notebookProvider.js.map