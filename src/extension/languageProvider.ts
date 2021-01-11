import * as vscode from 'vscode';
import { DEBUG_MODE, NAME } from '../common/common';
import { Method, MIMEType, RequestHeaderField } from '../common/httpConstants';

const selector: vscode.DocumentSelector = { language: NAME };
export class MethodCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = [];

    provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
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

        for(const field of Object.values(MIMEType)) {
            result.push({
                label: field,
                detail: 'HTTP MIME type',
                kind: vscode.CompletionItemKind.EnumMember
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
