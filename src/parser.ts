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

        if (linesOfRequest.filter(s => { return s; }).length === 0) {
            throw new Error('Please provide request information (at minimum a URL) before running the cell!');
        }

        logDebug(linesOfRequest);

        this.originalRequest = linesOfRequest;

        this.requestOptions = {
            method: this._parseMethod(),
            baseURL: this._parseBaseUrl()
        };


        this.requestOptions.params = this._parseQueryParams();
    }

    getAxiosOptions(): any {
        return pickBy(this.requestOptions, identity);
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

    private _parseQueryParams(): any | undefined {
        let queryInUrl = this.originalRequest[0].split('?')[1];
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

            if (parts.length !== 2) { throw new Error(`Invalid query paramter for ${p}`)}

            params[p.split('=')[0]] = p.split('=')[1];

            // TODO clean value to raw form?
        }

        return params;
    }

    private _parseHeader() {
        
    }

}