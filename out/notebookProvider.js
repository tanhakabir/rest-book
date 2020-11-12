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
class CallsNotebookProvider {
    constructor() {
        this.label = 'PostBox: REST Calls';
        this._onDidChangeNotebook = new vscode.EventEmitter();
        this.onDidChangeNotebook = this._onDidChangeNotebook.event;
        this._localDisposables = [];
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
            document.cells.map(cell => {
                contents.push({
                    kind: cell.cellKind,
                    language: cell.language,
                    value: cell.document.getText(),
                    editable: cell.metadata.editable
                });
            });
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
        //throw new Error('Method not implemented.');
    }
    cancelCellExecution(document, cell) {
        //throw new Error('Method not implemented.');
    }
    executeAllCells(document) {
        //throw new Error('Method not implemented.');
    }
    cancelAllCellsExecution(document) {
        //throw new Error('Method not implemented.');
    }
}
exports.CallsNotebookProvider = CallsNotebookProvider;
//# sourceMappingURL=notebookProvider.js.map