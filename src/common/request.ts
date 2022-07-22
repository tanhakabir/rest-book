import * as fs from 'fs';
import * as path from 'path';
var stringify = require('json-stringify-safe');
import { pickBy, identity, isEmpty } from 'lodash';
import { logDebug, formatURL, NAME } from './common';
import * as vscode from 'vscode';
import { Method, RequestHeaderField } from './httpConstants';
import * as cache from './cache';

// full documentation available here: https://github.com/axios/axios#request-config
// using default values for undefined
export interface Request {
    url?: string | undefined,
    method: string, 
    baseURL: string,
    headers?: any | undefined,
    params?: any | undefined,
    data?: string | any | undefined,
    timeout?: number | undefined,
    withCredentials?: boolean | false, 
    auth?: any | undefined,
    responseType?: string | undefined, 
    responseEncoding?: string | undefined, 
    xsrfCookieName?: string | undefined, 
    xsrfHeaderName?: string | undefined,
    maxContentLength?: number | undefined,
    maxBodyLength?: number | undefined,
    maxRedirects?: number | undefined, 
    socketPath?: any | undefined, 
    proxy?: any | undefined,
    decompress?: boolean | true 
}

export class RequestParser {
    private originalText: string[];
    private originalRequest: string[];
    private requestOptions: Request | undefined;
    private baseUrl?: string;
    private variableName: string | undefined;
    private valuesReplacedBySecrets: string[] = [];

    private readonly _variableMatchExp = /(?:\{\{)(SECRETS:)?([A-Za-z0-9._\-\[\]]*)(?:\}\})/ig;

    constructor(query: string, eol: vscode.EndOfLine) {

        let linesOfText = query.split((eol == vscode.EndOfLine.LF ? '\n' : '\r\n'));

        if (linesOfText.filter(s => { return s; }).length === 0) {
            throw new Error('Please provide request information (at minimum a URL) before running the cell!');
        }

        logDebug(linesOfText);

        this.originalText = linesOfText;

        this.originalRequest = this._parseOutVariableDeclarations();

        if(this.originalRequest.length == 0) { return; }

        this.variableName = this._parseVariableName();

        this.requestOptions = {
            method: this._parseMethod(),
            baseURL: this._parseBaseUrl(),
            timeout: 10000
        };

        this.requestOptions.params = this._parseQueryParams();

        let defaultHeaders = {};

        // eslint-disable-next-line @typescript-eslint/naming-convention
        if(process.env.NODE_ENV) {
            defaultHeaders = { "User-Agent": NAME };
        }
        this.requestOptions.headers = this._parseHeaders() ?? defaultHeaders;

        this.requestOptions.data = this._parseBody();
    }

    getRequest(): any | undefined {
        if(this.requestOptions === undefined) { return undefined; }
        return pickBy(this.requestOptions, identity);
    }

    getBaseUrl(): string | undefined {
        return this.baseUrl;
    }

    getVariableName(): string | undefined {
        return this.variableName;
    }

    wasReplacedBySecret(text: string): boolean {
        if(typeof text === 'string') {
            for(let replaced of this.valuesReplacedBySecrets) {
                if(text.includes(replaced)) {
                    return true;
                }
            }
        } else if(typeof text === 'number') {
            for(let replaced of this.valuesReplacedBySecrets) {
                if(`${text}`.includes(replaced)) {
                    return true;
                }
            }
        }

        return false;
    }

    private _parseOutVariableDeclarations(): string[] {
        const keyword = 'const ';
        let ret: string[] = [];

        let i = 0; 
        while(i < this.originalText.length && this.originalText[i].trim().match(/const\s([A-Za-z0-9]+)(\s)?=/)) {
            let line = this.originalText[i];
            let startIndex = (line.indexOf(keyword) + keyword.length);
            let nameLength = line.indexOf('=') - startIndex;
            let varName = line.substr(startIndex, nameLength).trim();
            let varValueStr = line.substr(line.indexOf('=') + 1).trim();

            try {
                let varValue = JSON.parse(varValueStr);
                cache.addToCache(varName, varValue);
            } catch (e) {
                cache.addToCache(varName, varValueStr);
            }

            i++;
        }

        while(i < this.originalText.length && (!this.originalText[i] || this.originalText[i].length === 0)) {
            i++;
        }

        for(i; i < this.originalText.length; i++) {
            ret.push(this.originalText[i]);
        }

        return ret;
    }

    private _parseVariableName(): string | undefined {
        let firstLine = this.originalRequest[0].trimLeft();
        if(!firstLine.startsWith('let ')) { return undefined; }

        let endIndexOfVarName = firstLine.indexOf('=') + 1;
        let varDeclaration = firstLine.substring(0, endIndexOfVarName);

        let variableName = varDeclaration.replace('let ', '');
        variableName = variableName.replace('=', '');
        variableName = variableName.trim();

        if (variableName.includes(' ')) { throw new Error('Invalid declaration of variable!'); }

        if(variableName === 'SECRETS') {
            throw new Error('"SECRETS" variable name reserved for Secrets storage!');
        }
        return variableName;
    }

    private _stripVariableDeclaration(): string {
        let firstLine = this.originalRequest[0].trimLeft();
        if(!firstLine.startsWith('let ')) { return firstLine; }

        let endIndexOfVarName = firstLine.indexOf('=') + 1;

        return firstLine.substring(endIndexOfVarName).trim();
    }

    private _parseMethod(): Method {
        const tokens: string[] = this._stripVariableDeclaration().split(/[\s,]+/);

        if (tokens.length === 0) { throw new Error('Invalid request!'); }

        if (tokens.length === 1) {
            return Method.get;
        }

        if( !(tokens[0].toLowerCase() in Method) ) {
            throw new Error('Invalid method given!');
        }

        return Method[<keyof typeof Method> tokens[0].toLowerCase()];
    }

    private _parseBaseUrl(): string {
        const tokens: string[] = this._stripVariableDeclaration().split(/(?<=^\S+)\s/);

        if (tokens.length === 0) { throw new Error('Invalid request!'); }

        const findAndReplaceVarsInUrl = (url: string) => {
            let tokens = url.split('/');

            for (let i = 0; i < tokens.length; i++) {
                let currentToken = tokens[i];

                tokens[i] = this._attemptToLoadVariable(currentToken);
            }

            let returnValue = tokens.join('/');
            return returnValue;
        };

        if (tokens.length === 1) {
            let url = findAndReplaceVarsInUrl(tokens[0].split('?')[0]);
            this.baseUrl = url;
            return formatURL(url);
        } else if (tokens.length === 2) {
            let url = findAndReplaceVarsInUrl(tokens[1].split('?')[0]);
            this.baseUrl = url;
            return formatURL(url);
        }
            
        throw new Error('Invalid URL given!');
    }

    private _parseQueryParams(): {[key: string] : string} | undefined {
        let queryInUrl = this._stripVariableDeclaration().split('?')[1];
        let strParams: string[] = queryInUrl ? queryInUrl.split('&') : [];

        if (this.originalRequest.length >= 2) { 
            let i = 1;

            while(i < this.originalRequest.length &&
                  (this.originalRequest[i].trim().startsWith('?') || 
                   this.originalRequest[i].trim().startsWith('&'))) {
                
                strParams.push(this.originalRequest[i].trim().substring(1));
                i++;

            }
        }

        if(strParams.length === 0) { return undefined; }

        let params: {[key: string] : string} = {};

        for(const p of strParams) {
            let parts = p.split('=');
            if (parts.length !== 2) { throw new Error(`Invalid query paramter for ${p}`); }

            params[parts[0]] = this._attemptToLoadVariable(parts[1].trim());
            params[parts[0]] = params[parts[0]].replace(/%20/g, '+');
        }

        return params;
    }

    private _parseHeaders(): {[key: string] : string} | undefined {
        if (this.originalRequest.length < 2) { return undefined; }

        let i = 1;

        while(i < this.originalRequest.length &&
            (this.originalRequest[i].trim().startsWith('?') || 
             this.originalRequest[i].trim().startsWith('&'))) {
          i++;
        }

        if(i >= this.originalRequest.length) { return undefined; }

        let headers: {[key: string] : string} = {};

        while(i < this.originalRequest.length && this.originalRequest[i]) {
            let h = this.originalRequest[i];
            let parts = h.split(/(:\s+)/).filter(s => { return !s.match(/(:\s+)/); });

            if (parts.length !== 2) { throw new Error(`Invalid header ${h}`); }

            if(parts[0] === 'User-Agent' && !process.env.NODE_ENV) {
                continue;
            }

            headers[parts[0]] = this._attemptToLoadVariable(parts[1].trim());
            i++;
        }

        return isEmpty(headers) ? undefined : headers;
    }

    private _parseBody(): {[key: string] : string} | string | undefined {
        if (this.originalRequest.length < 3) { return undefined; }

        let i = 0;

        while(i < this.originalRequest.length && this.originalRequest[i]) {
          i++;
        }

        i++;

        let bodyStr = this.originalRequest.slice(i).join('\n');

        let fileContents = this._attemptToLoadFile(bodyStr);
        if( fileContents ) { return fileContents; }

        if(bodyStr.startsWith('$')) {
            let variableContents = cache.attemptToLoadVariable(bodyStr.substr(1));
            if( variableContents ) { 
                if(bodyStr.startsWith('$SECRETS')) {
                    this.valuesReplacedBySecrets.push(variableContents);
                }
                return variableContents;
            }
        }

        try {
            let bodyObj = JSON.parse(bodyStr);
            // attemptToLoadVariableInObject(bodyObj); // TODO problems parsing body when given var name without quotes
            return bodyObj;
        } catch (e) {
            return bodyStr;
        }
    }

    private _attemptToLoadFile(possibleFilePath: string): string | undefined {
        try {
            const workSpaceDir = path.dirname(vscode.window.activeTextEditor?.document.uri.fsPath ?? '');
            if (!workSpaceDir) { return; }

            const absolutePath = path.join(workSpaceDir, possibleFilePath);
            return fs.readFileSync(absolutePath).toString();
        } catch (error) {
            // File doesn't exist
        }
        return;
    }

    private _attemptToLoadVariable(text: string): string {
        let groups = text.matchAll(this._variableMatchExp);

        for (let group of groups) {

            if (group.length !== 3) {
                console.log("Unable to process the extracted possible variable: ", group);
                continue;
            }

            let possibleVariable = group[2];
            let loadedFromVariable = cache.attemptToLoadVariable(possibleVariable);

            if (loadedFromVariable) {
                try {
                    if (typeof loadedFromVariable === 'string') {
                        if (group[1]?.toUpperCase() === 'SECRETS:') {
                            this.valuesReplacedBySecrets.push(loadedFromVariable);
                        }
                        return text.replace(group[0], loadedFromVariable);
                    } else {
                        return text.replace(group[0], stringify(loadedFromVariable));
                    }
                }
                catch (e) {
                    console.error(e);
                }
            }
        }

        return text;
    }
}
