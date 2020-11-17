// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { commandRESTCall } from './commandRESTCall';
import { CallsNotebookProvider } from './notebookProvider';

export const DEBUG_MODE = false;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "PostBox" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let pickDisposableCommand = vscode.commands.registerCommand('PostBox.commandRestCall', () => {
		// The code you place here will be executed every time your command is executed

		commandRESTCall(context).then(choice => {
			if (DEBUG_MODE) { console.log(`activate :: command selected ${choice.callType}`); }

			console.log(`INFO :: activate :: attempting to perform ${choice.callType} call.`);
		});
	});

	context.subscriptions.push(pickDisposableCommand);


	context.subscriptions.push(vscode.notebook.registerNotebookContentProvider('PostBox.restNotebook', new CallsNotebookProvider()))
}

// this method is called when your extension is deactivated
export function deactivate() {}
