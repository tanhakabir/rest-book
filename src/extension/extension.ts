// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NotebookKernel } from './notebookKernel';
import { NotebookSerializer } from './notebookSerializer';
import { registerLanguageProvider } from './languageProvider';
import { logDebug } from '../common/common';
import { registerCommands } from './commands';
import { initializeSecretsRegistry } from '../common/secrets';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('rest-book is now active!');

	// Regular kernel
	context.subscriptions.push(new NotebookKernel());
	// Kernel for interactive window
	context.subscriptions.push(new NotebookKernel(true));

	context.subscriptions.push(vscode.workspace.registerNotebookSerializer('rest-book', new NotebookSerializer(), {
		transientOutputs: false,
		transientCellMetadata: {
			inputCollapsed: true,
			outputCollapsed: true,
		}
	}));

	context.subscriptions.push(registerLanguageProvider());
	context.subscriptions.push(registerCommands(context.extension.id));

	initializeSecretsRegistry(context);
}

// this method is called when your extension is deactivated
export function deactivate() { }
