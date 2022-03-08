import * as vscode from 'vscode';
export declare class VariableCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters: string[];
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem> | null | undefined>;
    /**
     * Executes a shell command and return it as a Promise.
     * @param cmd {string}
     * @return {Promise<string>}
     */
    private execShellCommand;
    private readFile;
}
export declare function registerLanguageProvider(): vscode.Disposable;
