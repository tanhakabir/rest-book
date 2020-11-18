import { EOL } from 'os';
import { pickBy, identity } from 'lodash';
import { logDebug, validateURL } from './common';
import * as vscode from 'vscode';

// following guidance from https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html
export enum Method {
    options = "OPTIONS",
    get = "GET",
    head = "HEAD",
    post = "POST",
    put = "PUT",
    delete = "DELETE",
    trace = "TRACE",
    connect = "CONNECT"
}

// full documentation available here: https://github.com/axios/axios#request-config
// using default values for undefined
export interface AxiosOptions {
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

export class Parser {
    private originalRequest: string[];
    private requestOptions: AxiosOptions;

    constructor(cell: vscode.NotebookCell, 
                document: vscode.NotebookDocument) {

        const query = cell.document.getText();
        let linesOfRequest = query.split(EOL);
        linesOfRequest = linesOfRequest.filter(s => { return s; });

        logDebug(linesOfRequest);

        this.originalRequest = linesOfRequest;

        let method = this._parseMethod();
        let baseUrl = this._parseBaseUrl();

        this.requestOptions = {
            method: method,
            baseURL: baseUrl
        };
    }

    getAxiosOptions(): any {
        return pickBy(this.requestOptions, identity);
    }

    getMethod(): string  {
        return this.requestOptions.method;
    }

    getBaseUrl(): string {
        return this.requestOptions.baseURL;
    }

    private _parseMethod(): Method {
        const tokens: string[] = this.originalRequest[0].split(/[\s,]+/);

        if (tokens.length === 0) { throw new Error('Invalid request!'); }

        if (tokens.length === 1) {
            if (!validateURL(tokens[0])) {
                throw new Error('Invalid URL given!');
            }

            return Method.get;
        }

        if( !(tokens[0].toLowerCase() in Method) ) {
            throw new Error('Invalid method given!');
        }

        return Method[<keyof typeof Method> tokens[0].toLowerCase()];
    }

    private _parseBaseUrl(): string {
        const tokens: string[] = this.originalRequest[0].split(/[\s,]+/);

        if (tokens.length === 0) { throw new Error('Invalid request!'); }

        if (validateURL(tokens[0])) {
            return tokens[0];
        } else if(tokens.length > 1) {
            if(validateURL(tokens[1])) {
                return tokens[1];
            }
        }
            
        throw new Error('Invalid URL given!');
    }

}