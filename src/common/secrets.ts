import * as vscode from 'vscode';
var stringify = require('json-stringify-safe');

const SECRETS_KEY = 'rest-book-secrets';
var extContext: vscode.ExtensionContext;
export var secrets: { [key: string]: string} = {};

export function hasNoSecrets(): boolean {
    return Object.keys(secrets).length === 0;
}

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

export function getSecret(name: string): string | undefined {
    return secrets[name];
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

export function cleanForSecrets(text: string): string {
    if(typeof text === 'string') {
        let ret = text;
        for(let key of Object.keys(secrets)) {
            ret = ret.replace(secrets[key], `[SECRET ${key}]`);
        }
        return ret;
    } 

    if(typeof text === 'number') {
        for(let key of Object.keys(secrets)) {
            if(text === secrets[key]) {
                return `[SECRET ${key}]`;
            }
        }
    }

    return text;
}