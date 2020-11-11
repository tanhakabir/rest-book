"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsNotebookProvider = void 0;
const vscode = require("vscode");
class CallsNotebookProvider {
    constructor() {
        this._onDidChangeNotebook = new vscode.EventEmitter();
        this.onDidChangeNotebook = this._onDidChangeNotebook.event;
        this.label = 'PostBox: REST Calls';
    }
    openNotebook(uri, openContext) {
        throw new Error('Method not implemented.');
    }
    resolveNotebook(document, webview) {
        throw new Error('Method not implemented.');
    }
    saveNotebook(document, cancellation) {
        throw new Error('Method not implemented.');
    }
    saveNotebookAs(targetResource, document, cancellation) {
        throw new Error('Method not implemented.');
    }
    backupNotebook(document, context, cancellation) {
        throw new Error('Method not implemented.');
    }
    executeCell(document, cell) {
        throw new Error('Method not implemented.');
    }
    cancelCellExecution(document, cell) {
        throw new Error('Method not implemented.');
    }
    executeAllCells(document) {
        throw new Error('Method not implemented.');
    }
    cancelAllCellsExecution(document) {
        throw new Error('Method not implemented.');
    }
}
exports.CallsNotebookProvider = CallsNotebookProvider;
//# sourceMappingURL=notebookProvider.js.map