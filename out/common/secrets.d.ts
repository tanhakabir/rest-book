import * as vscode from 'vscode';
export declare function initializeSecretsRegistry(context: vscode.ExtensionContext): void;
export declare function getNamesOfSecrets(): string[];
export declare function getSecret(name: string): string | undefined;
export declare function addSecret(name: string, value: string): void;
export declare function deleteSecret(name: string): void;
