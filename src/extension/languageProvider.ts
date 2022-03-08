import * as vscode from 'vscode';
import * as fs from 'fs';
import * as shell from 'shelljs';
import { DEBUG_MODE, NAME } from '../common/common';
import { getVariableNames, getBaseUrls, attemptToLoadVariable } from '../common/cache';
import { Method, MIMEType, RequestHeaderField } from '../common/httpConstants';
import { result } from 'lodash';

const selector: vscode.DocumentSelector = { language: NAME };
// export class KeywordCompletionItemProvider implements vscode.CompletionItemProvider {
//     static readonly triggerCharacters = [];

//     provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
//         const result: vscode.CompletionItem[] = [];

//         let autocompleteMethod: Boolean = position.line === 0 ? true : false;

//         for(const field of Object.values(Method)) {
//             if(document.lineAt(position).text.includes(field)) {
//                 autocompleteMethod = false;
//             }
//         }

//         if(autocompleteMethod) {
//             for(const field of Object.values(Method)) {
//                 result.push({
//                     label: field,
//                     insertText: `${field} `,
//                     detail: 'HTTP request method',
//                     kind: vscode.CompletionItemKind.Method
//                 });
//             }
//         }

//         if(position.line !== 0) {
//             for(const field of Object.values(RequestHeaderField)) {
//                 result.push({
//                     label: field,
//                     insertText: `${field}: `,
//                     detail: 'HTTP request header field',
//                     kind: vscode.CompletionItemKind.Field
//                 });
//             }
//         }

//         for(const url of getBaseUrls()) {
//             result.push({
//                 label: url,
//                 kind: vscode.CompletionItemKind.Keyword
//             });
//         }

//         ["const", "let"].forEach(str => {
//             result.push({
//                 label: str,
//                 insertText: `${str} `,
//                 kind: vscode.CompletionItemKind.Keyword
//             });
//         })
        
//         return result;
//     }
// }

// export class HeaderCompletionItemProvider implements vscode.CompletionItemProvider {
//     static readonly triggerCharacters = [':'];

//     provideCompletionItems(_document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
//         const result: vscode.CompletionItem[] = [];

//         if(position.line === 0) { return result; }

//         for(const field of Object.values(MIMEType)) {
//             result.push({
//                 label: field,
//                 detail: 'HTTP MIME type',
//                 kind: vscode.CompletionItemKind.EnumMember
//             });
//         }
        
//         return result;
//     }
// }

// export class CacheVariableCompletionItemProvider implements vscode.CompletionItemProvider {
//     static readonly triggerCharacters = ['$'];

//     provideCompletionItems(_document: vscode.TextDocument, _position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
//         const result: vscode.CompletionItem[] = [];

//         for(const variable of getVariableNames()) {
//             result.push({
//                 label: variable,
//                 kind: vscode.CompletionItemKind.Variable
//             });
//         }
        
//         return result;
//     }
// }



export class VariableCompletionItemProvider implements vscode.CompletionItemProvider {
    static readonly triggerCharacters = ['.'];


    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem> | null | undefined>{
        //const val = await this.readFile('abc.txt');

        const val = await this.execShellCommand("echo 'swap(x, y)' | comby -stdin 'swap(:[1], :[2])' 'swap(:[2], :[1])'  .py | sed 's/\x1b\[[0-9;]*m//g'");
        //console.log(val);
        if(!val) {return undefined;}

        const result: vscode.CompletionItem[] = [];
        for(let i of val) {
            result.push({
                label: i,
                kind: vscode.CompletionItemKind.Variable
            });
        }
        console.log(val);


        result.push({
            label: "Text: "+document.getText(),
            kind: vscode.CompletionItemKind.Variable
        });

        result.push({
            label: 'Line: '+position.line.toString(),
            kind: vscode.CompletionItemKind.Variable
        });

        return result;
      }
    /**
     * Executes a shell command and return it as a Promise.
     * @param cmd {string}
     * @return {Promise<string>}
     */
    private async execShellCommand(cmd: string) {
        const exec = require('child_process').exec;
        return new Promise((resolve) => {
            exec(cmd, (error: any, stdout: string, stderr: unknown) => {
            if (error) {
                console.warn(error);
            }
                resolve(stdout? stdout.toString().replace(/\r\n/g,'\n').split('\n') : stderr);
            });
        });
   }


    private async readFile(path: string){
        try {
            const data = fs.readFileSync(path, 'utf-8');
            //console.log(data);

            return data.toString().replace(/\r\n/g,'\n').split('\n');
          } catch (err) {
            console.error(err);
          }
      }
}


export class VariableHoverItemProvider implements vscode.HoverProvider {
    async provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): Promise<vscode.Hover | null | undefined> {
        const val: string[] = await this.execShellCommand("echo 'swap(x, y)' | comby -stdin 'swap(:[1], :[2])' 'swap(:[2], :[1])'  .py | sed 's/\x1b\[[0-9;]*m//g'");

        console.log(val.toString);
        return new vscode.Hover({
            language: "ML Feed",
            value: val.join('\n')
        }); 
    }

    private async execShellCommand(cmd: string): Promise<string[]> {
        const exec = require('child_process').exec;
        return new Promise((resolve) => {
            exec(cmd, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.warn(error);
            }
                resolve(stdout? stdout.toString().replace(/\r\n/g,'\n').split('\n') : stderr.toString().replace(/\r\n/g,'\n').split('\n'));
            });
        });
   }
}

  
export function registerLanguageProvider(): vscode.Disposable {
    const disposables: vscode.Disposable[] = [];

    disposables.push(vscode.languages.registerCompletionItemProvider(selector, new VariableCompletionItemProvider(), ...VariableCompletionItemProvider.triggerCharacters));
    disposables.push(vscode.languages.registerHoverProvider(selector, new VariableHoverItemProvider()));
    return vscode.Disposable.from(...disposables);
}


