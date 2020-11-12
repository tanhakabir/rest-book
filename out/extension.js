"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.DEBUG_MODE = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const commandRESTCall_1 = require("./commandRESTCall");
const notebookProvider_1 = require("./notebookProvider");
exports.DEBUG_MODE = false;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "PostBox" is now active!');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let pickDisposableCommand = vscode.commands.registerCommand('PostBox.commandRestCall', () => {
        // The code you place here will be executed every time your command is executed
        commandRESTCall_1.commandRESTCall(context).then(choice => {
            if (exports.DEBUG_MODE) {
                console.log(`activate :: command selected ${choice.callType}`);
            }
            console.log(`INFO :: activate :: attempting to perform ${choice.callType} call.`);
        });
    });
    context.subscriptions.push(pickDisposableCommand);
    context.subscriptions.push(vscode.notebook.registerNotebookContentProvider('PostBox.restNotebook', new notebookProvider_1.CallsNotebookProvider()));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map