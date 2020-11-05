// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { showCallTypeQuickPick } from './commandRESTCall';

export const DEBUG_MODE = true;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "PostBox" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('PostBox.helloWorld', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Post Box!');
	});

	context.subscriptions.push(disposable);


	let pickDisaposableCommand = vscode.commands.registerCommand('PostBox.commandRestCall', () => {
		showCallTypeQuickPick().then(choice => {
			vscode.window.showInformationMessage(`Starting ${choice} call.`);
			if (DEBUG_MODE) { console.log(`activate :: command selected ${choice}`); }

			console.log(`INFO :: activate :: attempting to perform ${choice} call.`);
		});
	});

	context.subscriptions.push(pickDisaposableCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {}
