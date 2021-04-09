// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NotebookProvider } from './notebookProvider';
import { registerLanguageProvider } from './languageProvider';
import { logDebug } from '../common/common';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('rest-book is now active!');
	
	const notebookProvider = new NotebookProvider();
	context.subscriptions.push(vscode.notebook.registerNotebookKernelProvider({ viewType: 'rest-book' }, notebookProvider));
	context.subscriptions.push(vscode.notebook.registerNotebookSerializer('rest-book', notebookProvider, {
		transientOutputs: false,
		transientMetadata: {
			inputCollapsed: true,
			outputCollapsed: true,
			statusMessage: true,
			editable: false,
		}
	}));

	context.subscriptions.push(registerLanguageProvider());
}

// this method is called when your extension is deactivated
export function deactivate() {}
