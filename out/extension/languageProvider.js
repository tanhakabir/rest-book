"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerLanguageProvider = exports.MethodCompletionItemProvider = void 0;
const vscode = require("vscode");
const common_1 = require("../common/common");
const httpConstants_1 = require("../common/httpConstants");
const selector = { language: common_1.NAME };
class MethodCompletionItemProvider {
    provideCompletionItems(document, position, token, context) {
        const result = [];
        for (const field of Object.values(httpConstants_1.Method)) {
            result.push({
                label: field,
                insertText: `${field} `,
                detail: 'HTTP request method',
                kind: vscode.CompletionItemKind.Method
            });
        }
        for (const field of Object.values(httpConstants_1.RequestHeaderField)) {
            result.push({
                label: field,
                insertText: `${field}: `,
                detail: 'HTTP request header field',
                kind: vscode.CompletionItemKind.Field
            });
        }
        for (const field of Object.values(httpConstants_1.MIMEType)) {
            result.push({
                label: field,
                detail: 'HTTP MIME type',
                kind: vscode.CompletionItemKind.EnumMember
            });
        }
        return result;
    }
}
exports.MethodCompletionItemProvider = MethodCompletionItemProvider;
MethodCompletionItemProvider.triggerCharacters = [];
function registerLanguageProvider() {
    const disposables = [];
    // TODO add hover provider or definition provider
    disposables.push(vscode.languages.registerCompletionItemProvider(selector, new MethodCompletionItemProvider(), ...MethodCompletionItemProvider.triggerCharacters));
    return vscode.Disposable.from(...disposables);
}
exports.registerLanguageProvider = registerLanguageProvider;
//# sourceMappingURL=languageProvider.js.map