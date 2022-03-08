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

    // provideCompletionItems(document: vscode.TextDocument, position: vscode.TextDocument, _token: vscode.CancellationToken, _context: vscode.CompletionContext): Promise<vscode.CompletionItem[]> {
    //     const result: vscode.CompletionItem[] = [];

    //     let text = document.lineAt(position.line).text.substring(0, position.character);
    //     let startingIndex =  Math.max(text.lastIndexOf(' '), text.lastIndexOf('='), text.lastIndexOf('/')) + 1;
    //     let varName = text.substring(startingIndex).trim();
    //     //await this.comby("echo 'swap(x, y)\nswap(x,y)' | comby -stdin 'swap(:[1], :[2])' 'swap(:[2], :[1])'  .py | sed 's/\x1b\[[0-9;]*m//g'" );
        
    //     fs.readFile('abc.txt', function(err, data) {
    //         if(err) {throw err;}
        
    //         const arr: string[] = data.toString().replace(/\r\n/g,'\n').split('\n');
        
    //         for(let i of arr) {
    //             console.log(i);
    //             result.push({
    //                 label: i,
    //                 kind: vscode.CompletionItemKind.Variable
    //             });
    //         }

    //         return result;
    //     });

    //     result.push({
    //         label: "ol",
    //         kind: vscode.CompletionItemKind.Variable
    //     });
        
    //     // if(matchingData && typeof matchingData === 'object') {
    //     //     for(let key of Object.keys(matchingData)) {
    //     //         result.push({
    //     //             label: key,
    //     //             kind: vscode.CompletionItemKind.Variable
    //     //         });
    //     //     }
    //     // }
        

        

    //     // return new Promise(() => {
    //     //     setTimeout(() => { result; }, 10);
    //     //   });

    //     //return result;
    // }

    async provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, _token: vscode.CancellationToken, _context: vscode.CompletionContext): Promise<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem> | null | undefined>{
        const val = await this.readFile('abc.txt');
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
        return result;
      }

    // private async comby(command: string): Promise<string[]>{
    //     // var exec = require('child_process').exec;
    //     // var child;
    //     // // var command: string = "echo 'these are words 123' | comby -stdin ':[[x]]' ':[[x]].Capitalize' -lang .txt";
    //     // // var command = "echo 'swap(x, y)' | comby -stdin 'swap(:[1], :[2])' 'swap(:[2], :[1])'  .py";
    //     // child = exec(command,
    //     //    function (error: string | null, stdout: string, stderr: string) {
    //     //     //   console.log('stdout: ' + stdout.substring(0));
    //     //     //   console.log('stdout: ' + stdout);
    //     //       //console.log('stderr: ' + stderr);
    //     //       if (error !== null) {
    //     //           console.log('exec error: ' + error);
    //     //       }

    //     //       return stdout.substring(0);
    //     //   });
        
    //     // //console.log(child);
    //     // return Promise.resolve('');
    //     // var data = await shell.exec(command, {silent:true}, (code: any, output: any) => {
    //     //     //console.log(output);
    //     //     //fs.writeFileSync("abc.txt", output);
    //     // });


    //     fs.readFile('abc.txt', function(err, data) {
    //         if(err) {throw err;}
                
    //         const arr: string[] = data.toString().replace(/\r\n/g,'\n').split('\n');
    //         console.log(arr);
    //         return await Promise.resolve(arr);
    //     });
        
        
    // }


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




  
export function registerLanguageProvider(): vscode.Disposable {
    const disposables: vscode.Disposable[] = [];

    disposables.push(vscode.languages.registerCompletionItemProvider(selector, new VariableCompletionItemProvider(), ...VariableCompletionItemProvider.triggerCharacters));
    return vscode.Disposable.from(...disposables);
}


