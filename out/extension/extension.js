"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require("vscode");
var notebookKernel_1 = require("./notebookKernel");
var notebookSerializer_1 = require("./notebookSerializer");
var languageProvider_1 = require("./languageProvider");
var commands_1 = require("./commands");
var secrets_1 = require("../common/secrets");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('rest-book is now active!');
    context.subscriptions.push(new notebookKernel_1.NotebookKernel());
    context.subscriptions.push(vscode.workspace.registerNotebookSerializer('rest-book', new notebookSerializer_1.NotebookSerializer(), {
        transientOutputs: false,
        transientCellMetadata: {
            inputCollapsed: true,
            outputCollapsed: true,
        }
    }));
    context.subscriptions.push(languageProvider_1.registerLanguageProvider());
    context.subscriptions.push(commands_1.registerCommands());
    secrets_1.initializeSecretsRegistry(context);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map