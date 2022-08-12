import * as vscode from 'vscode';
import { DEBUG_MODE, NAME } from '../common/common';
import { getVariableNames, getBaseUrls } from '../common/cache';
import { VariableParser } from '../common/variableParser';
import { Method, MIMEType, RequestHeaderField } from '../common/httpConstants';

const selector: vscode.DocumentSelector = { language: NAME };

export class KeywordCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = [];

    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const result: vscode.CompletionItem[] = [];

        let autocompleteMethod: Boolean = position.line === 0 ? true : false;

        for (const field of Object.values(Method)) {
            if (document.lineAt(position).text.includes(field)) {
                autocompleteMethod = false;
            }
        }

        if (autocompleteMethod) {
            for (const field of Object.values(Method)) {
                result.push({
                    label: field,
                    insertText: `${field} `,
                    detail: 'HTTP request method',
                    kind: vscode.CompletionItemKind.Method
                });
            }
        }

        if (position.line !== 0) {
            for (const field of Object.values(RequestHeaderField)) {
                result.push({
                    label: field,
                    insertText: `${field}: `,
                    detail: 'HTTP request header field',
                    kind: vscode.CompletionItemKind.Field
                });
            }
        }

        for (const url of getBaseUrls()) {
            result.push({
                label: url,
                kind: vscode.CompletionItemKind.Keyword
            });
        }

        ["const", "let"].forEach(str => {
            result.push({
                label: str,
                insertText: `${str} `,
                kind: vscode.CompletionItemKind.Keyword
            });
        });

        return result;
    }
}

export class HeaderCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = [':'];

    provideCompletionItems(_document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const result: vscode.CompletionItem[] = [];

        if (position.line === 0) { return result; }

        for (const field of Object.values(MIMEType)) {
            result.push({
                label: field,
                detail: 'HTTP MIME type',
                kind: vscode.CompletionItemKind.EnumMember
            });
        }

        return result;
    }
}

export class CacheVariableCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = ['$'];

    provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const result: vscode.CompletionItem[] = [];

        for (const variable of getVariableNames()) {
            result.push({
                label: variable,
                kind: vscode.CompletionItemKind.Variable
            });
        }

        return result;
    }
}

export class VariableHoverProvider implements vscode.HoverProvider {
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        
        console.debug("Hover called:", document, position, token);

        let range =
            document.getWordRangeAtPosition(position, VariableParser.instance.curlyBracketsVarMatchExp) ??
            document.getWordRangeAtPosition(position, VariableParser.instance.dollarSignVarMatchExp);

        if (!range) {
            return;
        }

        const word = document.getText(range);

        const variableResolveResult = VariableParser.instance.attemptToLoadVariable(word);

        let hoverContent = null;
        if (!variableResolveResult.hasResolved) {
            let msgString = new vscode.MarkdownString(
                `Couldn't find a variable named ${word}.<br/>Ensure the request declaring it has been sent or that the path is valid.`);
            msgString.supportHtml = true;
            hoverContent = new vscode.Hover(msgString, range);
        } else {
            hoverContent = new vscode.Hover(
                new vscode.MarkdownString(`*Variable* ${word}: ${variableResolveResult.value}`),
                range);
        }
        return hoverContent;
    }

}

export class VariableCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = ['.'];

    provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        const result: vscode.CompletionItem[] = [];

        let text = document.lineAt(position.line).text.substring(0, position.character);
        let startingIndex = Math.max(text.lastIndexOf(' '), text.lastIndexOf('='), text.lastIndexOf('/')) + 1;
        let varName = text.substring(startingIndex).trim();

        const matchesVariable = varName.startsWith('$') || varName.startsWith('{{');
        if (!matchesVariable) {
            return result;
        }

        varName = varName.substr(1, varName.length - 2);

        let matchingData = VariableParser.instance.attemptToLoadVariable(varName);

        if (matchingData && typeof matchingData === 'object') {
            for (let key of Object.keys(matchingData)) {
                result.push({
                    label: key,
                    kind: vscode.CompletionItemKind.Variable
                });
            }
        }

        return result;
    }
}


export function registerLanguageProvider(): vscode.Disposable {
    const disposables: vscode.Disposable[] = [];

    // TODO add hover provider or definition provider
    disposables.push(
        vscode.languages.registerCompletionItemProvider(
            selector, new KeywordCompletionItemProvider(), ...KeywordCompletionItemProvider.triggerCharacters));
    disposables.push(
        vscode.languages.registerCompletionItemProvider(
            selector, new HeaderCompletionItemProvider(), ...HeaderCompletionItemProvider.triggerCharacters));
    disposables.push(
        vscode.languages.registerCompletionItemProvider(
            selector, new CacheVariableCompletionItemProvider(), ...CacheVariableCompletionItemProvider.triggerCharacters));
    disposables.push(
        vscode.languages.registerCompletionItemProvider(
            selector, new VariableCompletionItemProvider(), ...VariableCompletionItemProvider.triggerCharacters));
    disposables.push(
        vscode.languages.registerHoverProvider(selector, new VariableHoverProvider())
    );
    return vscode.Disposable.from(...disposables);
}
