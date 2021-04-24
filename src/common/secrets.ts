import * as vscode from 'vscode';
var stringify = require('json-stringify-safe');

const SECRETS_KEY = 'rest-book-secrets';
var extContext: vscode.ExtensionContext;
var secrets: { [key: string]: string} = {};

export function initializeSecretsRegistry(context: vscode.ExtensionContext) {
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

export function addSecret(name: string, value: string) {
    secrets[name] = value;
    _saveSecrets();
}

export function deleteSecret(name: string) {
    delete secrets[name];
    _saveSecrets();
}

function _saveSecrets() {
    extContext.secrets.store(SECRETS_KEY, stringify(secrets));
}