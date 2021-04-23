import * as vscode from 'vscode';

const SECRETS_KEY = 'rest-book-secrets';
var extContext: vscode.ExtensionContext;
var secrets: { [key: string]: string} = {};

export function initialize(context: vscode.ExtensionContext) {
    extContext = context;

    context.secrets.get(SECRETS_KEY).then((contents: any) => {
        try {
            secrets = JSON.parse(contents);
        } catch {
            secrets = {};
        }
    });
}

export function getNamesOfSecrets(): string[] {
    return Object.keys(secrets);
}