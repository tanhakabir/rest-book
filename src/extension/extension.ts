// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { NotebookKernel } from './notebookKernel';
import { NotebookSerializer } from './notebookSerializer';
import { registerLanguageProvider } from './languageProvider';
import { logDebug } from '../common/common';
import { registerCommands } from './commands';
import { initializeSecretsRegistry } from '../common/secrets';
import { SelectionRange } from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('ml-feed is now active!');
	
	// Regular kernel
	context.subscriptions.push(new NotebookKernel());
	// Kernel for interactive window
	context.subscriptions.push(new NotebookKernel(true));

	context.subscriptions.push(vscode.workspace.registerNotebookSerializer('ml-feed', new NotebookSerializer(), {
		transientOutputs: false,
		transientCellMetadata: {
			inputCollapsed: true,
			outputCollapsed: true,
		}
	}));
	context.subscriptions.push( registerLanguageProvider());
	context.subscriptions.push(registerCommands(context.extension.id));

	// vscode.languages.registerHoverProvider('ml-feed', {
	// 	provideHover(document, position, token) {
			
	// 		console.log(document.lineAt(0));
	// 		console.log(position);
	// 	  return {
	// 		contents: ['Hover Content']
	// 	  };
	// 	}
	//   });

	// initializeSecretsRegistry(context);

	// vscode.languages.registerSelectionRangeProvider('ml-feed', {
	// 	provideSelectionRanges( document, positions): Promise<SelectionRange[]>  {
			
	// 		var v = new SelectionRange( new vscode.Range(positions[0], positions[0]));
	// 		return v;
	// 	}
	// }
	// );
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
