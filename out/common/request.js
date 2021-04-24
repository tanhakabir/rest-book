import * as os from 'os';
const { EOL } = os;
import * as fs from 'fs';
import * as path from 'path';
var stringify = require('json-stringify-safe');
import { pickBy, identity, isEmpty } from 'lodash';
import { logDebug, formatURL, NAME } from './common';
import * as vscode from 'vscode';
import { Method } from './httpConstants';
import * as cache from './cache';
export class RequestParser {
    constructor(query) {
        var _a;
        this.valuesReplacedBySecrets = [];
        let linesOfRequest = query.split(EOL);
        if (linesOfRequest.filter(s => { return s; }).length === 0) {
            throw new Error('Please provide request information (at minimum a URL) before running the cell!');
        }
        logDebug(linesOfRequest);
        this.originalRequest = linesOfRequest;
        this.variableName = this._parseVariableName();
        this.requestOptions = {
            method: this._parseMethod(),
            baseURL: this._parseBaseUrl(),
            timeout: 1000
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
    getBaseUrl() {
        return this.baseUrl;
    }
    getVariableName() {
        return this.variableName;
    }
    wasReplacedBySecret(text) {
        if (typeof text === 'string') {
            for (let replaced of this.valuesReplacedBySecrets) {
                if (text.includes(replaced)) {
                    return true;
                }
            }
        }
        else if (typeof text === 'number') {
            for (let replaced of this.valuesReplacedBySecrets) {
                if (`${text}`.includes(replaced)) {
                    return true;
                }
            }
        }
        return false;
    }
    _parseVariableName() {
        let firstLine = this.originalRequest[0].trimLeft();
        if (!firstLine.startsWith('let ')) {
            return undefined;
        }
        let endIndexOfVarName = firstLine.indexOf('=') + 1;
        let varDeclaration = firstLine.substring(0, endIndexOfVarName);
        let variableName = varDeclaration.replace('let ', '');
        variableName = variableName.replace('=', '');
        variableName = variableName.trim();
        if (variableName.includes(' ')) {
            throw new Error('Invalid declaration of variable!');
        }
        return variableName;
    }
    _stripVariableDeclaration() {
        let firstLine = this.originalRequest[0].trimLeft();
        if (!firstLine.startsWith('let ')) {
            return firstLine;
        }
        let endIndexOfVarName = firstLine.indexOf('=') + 1;
        return firstLine.substring(endIndexOfVarName).trim();
    }
    _parseMethod() {
        const tokens = this._stripVariableDeclaration().split(/[\s,]+/);
        if (tokens.length === 0) {
            throw new Error('Invalid request!');
        }
        if (tokens.length === 1) {
            return Method.get;
        }
        if (!(tokens[0].toLowerCase() in Method)) {
            throw new Error('Invalid method given!');
        }
        return Method[tokens[0].toLowerCase()];
    }
    _parseBaseUrl() {
        const tokens = this._stripVariableDeclaration().split(/[\s]+/);
        if (tokens.length === 0) {
            throw new Error('Invalid request!');
        }
        if (tokens.length === 1) {
            let url = tokens[0].split('?')[0];
            this.baseUrl = url;
            return formatURL(url);
        }
        else if (tokens.length === 2) {
            let url = tokens[1].split('?')[0];
            this.baseUrl = url;
            return formatURL(url);
        }
        throw new Error('Invalid URL given!');
    }
    _parseQueryParams() {
        let queryInUrl = this._stripVariableDeclaration().split('?')[1];
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
            params[parts[0]] = this._attemptToLoadVariable(parts[1].trim());
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
            headers[parts[0]] = this._attemptToLoadVariable(parts[1].trim());
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
        if (bodyStr.startsWith('$')) {
            let variableContents = cache.attemptToLoadVariable(bodyStr.substr(1));
            if (variableContents) {
                if (bodyStr.startsWith('$secrets')) {
                    this.valuesReplacedBySecrets.push(variableContents);
                }
                return variableContents;
            }
        }
        try {
            let bodyObj = JSON.parse(bodyStr);
            // attemptToLoadVariableInObject(bodyObj); // TODO problems parsing body when given var name without quotes
            return bodyObj;
        }
        catch (e) {
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
    _attemptToLoadVariable(text) {
        if (!text.startsWith('$')) {
            return text;
        }
        let loadedFromVariable = cache.attemptToLoadVariable(text.substring(1));
        if (loadedFromVariable) {
            if (typeof loadedFromVariable === 'string') {
                if (text.startsWith('$secrets')) {
                    this.valuesReplacedBySecrets.push(loadedFromVariable);
                }
                return loadedFromVariable;
            }
            else {
                return stringify(loadedFromVariable);
            }
        }
        return text;
    }
}
//# sourceMappingURL=request.js.map