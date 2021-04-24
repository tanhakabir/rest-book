import * as vscode from 'vscode';
var stringify = require('json-stringify-safe');

const SECRETS_KEY = 'rest-book-secrets';
var extContext: vscode.ExtensionContext;
export var SECRETS: { [key: string]: string} = {};

export function hasNoSecrets(): boolean {
    return Object.keys(SECRETS).length === 0;
}

export function initializeSecretsRegistry(context: vscode.ExtensionContext) {
    extContext = context;

    context.secrets.get(SECRETS_KEY).then((contents: any) => {
        try {
            SECRETS = JSON.parse(contents);
        } catch {
            SECRETS = {};
        }
    });
}

export function getNamesOfSecrets(): string[] {
    return Object.keys(SECRETS);
}

export function getSecret(name: string): string | undefined {
    return SECRETS[name];
}

export function addSecret(name: string, value: string) {
    SECRETS[name] = value;
    _saveSecrets();
}

export function deleteSecret(name: string) {
    delete SECRETS[name];
    _saveSecrets();
}

function _saveSecrets() {
    extContext.secrets.store(SECRETS_KEY, stringify(SECRETS));
}

export function cleanForSecrets(text: string): string {
    if(typeof text === 'string') {
        let ret = text;
        for(let key of Object.keys(SECRETS)) {
            ret = ret.replace(SECRETS[key], `[SECRET ${key}]`);
        }
        return ret;
    } 

    if(typeof text === 'number') {
        for(let key of Object.keys(SECRETS)) {
            if(text === SECRETS[key]) {
                return `[SECRET ${key}]`;
            }
        }
    }

    return text;
}