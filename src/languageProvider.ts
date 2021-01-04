import * as vscode from 'vscode';
import { DEBUG_MODE, NAME } from './common';

const selector: vscode.DocumentSelector = { language: NAME }

export function registerLanguageProvider(): vscode.Disposable {
    const disposables: vscode.Disposable[] = [];

    return vscode.Disposable.from(...disposables);
}
