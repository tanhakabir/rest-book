import * as vscode from 'vscode';
import { DEBUG_MODE, NAME } from './common';
import { Method, RequestHeaderField } from './httpConstants';

const selector: vscode.DocumentSelector = { language: NAME };
export class MethodCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = [];

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const result: vscode.CompletionItem[] = [];

        for(const field of Object.values(Method)) {
            result.push({
                label: field,
                insertText: `${field} `,
                detail: 'HTTP request method',
                kind: vscode.CompletionItemKind.Method
            });
        }

        for(const field of Object.values(RequestHeaderField)) {
            result.push({
                label: field,
                insertText: `${field}: `,
                detail: 'HTTP request header field',
                kind: vscode.CompletionItemKind.Field
            });
        }
        
        return result;
    }
}

export function registerLanguageProvider(): vscode.Disposable {
    const disposables: vscode.Disposable[] = [];

    // TODO add hover provider or definition provider
    disposables.push(vscode.languages.registerCompletionItemProvider(selector, new MethodCompletionItemProvider(), ...MethodCompletionItemProvider.triggerCharacters));

    return vscode.Disposable.from(...disposables);
}
