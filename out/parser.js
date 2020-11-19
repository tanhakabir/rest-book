"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = exports.Method = void 0;
const os_1 = require("os");
const lodash_1 = require("lodash");
const common_1 = require("./common");
// following guidance from https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html
var Method;
(function (Method) {
    Method["options"] = "OPTIONS";
    Method["get"] = "GET";
    Method["head"] = "HEAD";
    Method["post"] = "POST";
    Method["put"] = "PUT";
    Method["delete"] = "DELETE";
    Method["trace"] = "TRACE";
    Method["connect"] = "CONNECT";
})(Method = exports.Method || (exports.Method = {}));
class Parser {
    constructor(cell, document) {
        const query = cell.document.getText();
        let linesOfRequest = query.split(os_1.EOL);
        if (linesOfRequest.filter(s => { return s; }).length === 0) {
            throw new Error('Please provide request information (at minimum a URL) before running the cell!');
        }
        common_1.logDebug(linesOfRequest);
        this.originalRequest = linesOfRequest;
        this.requestOptions = {
            method: this._parseMethod(),
            baseURL: this._parseBaseUrl()
        };
        this.requestOptions.params = this._parseQueryParams();
    }
    getAxiosOptions() {
        return lodash_1.pickBy(this.requestOptions, lodash_1.identity);
    }
    _parseMethod() {
        const tokens = this.originalRequest[0].split(/[\s,]+/);
        if (tokens.length === 0) {
            throw new Error('Invalid request!');
        }
        if (tokens.length === 1) {
            if (!common_1.validateURL(tokens[0])) {
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
        if (common_1.validateURL(tokens[0])) {
            return tokens[0];
        }
        else if (tokens.length > 1) {
            if (common_1.validateURL(tokens[1])) {
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
            params[p.split('=')[0]] = p.split('=')[1];
            // TODO clean value to raw form?
        }
        return params;
    }
    _parseHeader() {
    }
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map