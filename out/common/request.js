import * as os from 'os';
const { EOL } = os;
import * as fs from 'fs';
import * as path from 'path';
import { pickBy, identity, isEmpty } from 'lodash';
import { logDebug, validateURL, NAME } from './common';
import * as vscode from 'vscode';
import { Method } from './httpConstants';
export class RequestParser {
    constructor(query) {
        var _a;
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        let defaultHeaders = { "User-Agent": NAME };
        this.requestOptions.headers = (_a = this._parseHeaders()) !== null && _a !== void 0 ? _a : defaultHeaders;
        this.requestOptions.data = this._parseBody();
    }
    getRequest() {
        return pickBy(this.requestOptions, identity);
    }
    _parseMethod() {
        const tokens = this.originalRequest[0].split(/[\s,]+/);
        if (tokens.length === 0) {
            throw new Error('Invalid request!');
        }
        if (tokens.length === 1) {
            if (!validateURL(tokens[0])) {
                throw new Error('Invalid URL given!');
            }
            return Method.get;
        }
        if (!(tokens[0].toLowerCase() in Method)) {
            throw new Error('Invalid method given!');
        }
        return Method[tokens[0].toLowerCase()];
    }
    _parseBaseUrl() {
        const tokens = this.originalRequest[0].split(/[\s,]+/);
        if (tokens.length === 0) {
            throw new Error('Invalid request!');
        }
        if (validateURL(tokens[0])) {
            return tokens[0];
        }
        else if (tokens.length > 1) {
            if (validateURL(tokens[1])) {
                return tokens[1];
            }
        }
        throw new Error('Invalid URL given!');
    }
    _parseQueryParams() {
        let queryInUrl = this.originalRequest[0].split('?')[1];
        let strParams = queryInUrl ? queryInUrl.split('&') : [];
        if (this.originalRequest.length >= 2) {
            let i = 1;
            while (i < this.originalRequest.length &&
                (this.originalRequest[i].trim().startsWith('?') ||
                    this.originalRequest[i].trim().startsWith('&'))) {
                strParams.push(this.originalRequest[i].trim().substring(1));
                i++;
            }
        }
        if (strParams.length === 0) {
            return undefined;
        }
        let params = {};
        for (const p of strParams) {
            let parts = p.split('=');
            if (parts.length !== 2) {
                throw new Error(`Invalid query paramter for ${p}`);
            }
            params[parts[0]] = parts[1];
            // TODO clean value to raw form?
        }
        return params;
    }
    _parseHeaders() {
        if (this.originalRequest.length < 2) {
            return undefined;
        }
        let i = 1;
        while (i < this.originalRequest.length &&
            (this.originalRequest[i].trim().startsWith('?') ||
                this.originalRequest[i].trim().startsWith('&'))) {
            i++;
        }
        if (i >= this.originalRequest.length) {
            return undefined;
        }
        let headers = {};
        while (i < this.originalRequest.length && this.originalRequest[i]) {
            let h = this.originalRequest[i];
            let parts = h.split(/(:\s+)/).filter(s => { return !s.match(/(:\s+)/); });
            if (parts.length !== 2) {
                throw new Error(`Invalid header ${h}`);
            }
            headers[parts[0]] = parts[1];
            i++;
        }
        return isEmpty(headers) ? undefined : headers;
    }
    _parseBody() {
        if (this.originalRequest.length < 3) {
            return undefined;
        }
        let i = 0;
        while (i < this.originalRequest.length && this.originalRequest[i]) {
            i++;
        }
        i++;
        let bodyStr = this.originalRequest.slice(i).join('\n');
        let fileContents = this._attemptToLoadFile(bodyStr);
        if (fileContents) {
            return fileContents;
        }
        try {
            return JSON.parse(bodyStr);
        }
        catch {
            return bodyStr;
        }
    }
    _attemptToLoadFile(possibleFilePath) {
        var _a, _b;
        try {
            const workSpaceDir = path.dirname((_b = (_a = vscode.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document.uri.fsPath) !== null && _b !== void 0 ? _b : '');
            if (!workSpaceDir) {
                return;
            }
            const absolutePath = path.join(workSpaceDir, possibleFilePath);
            return fs.readFileSync(absolutePath).toString();
        }
        catch (error) {
            // File doesn't exist
        }
        return;
    }
}
//# sourceMappingURL=request.js.map