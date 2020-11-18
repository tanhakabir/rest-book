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
        linesOfRequest = linesOfRequest.filter(s => { return s; });
        common_1.logDebug(linesOfRequest);
        this.originalRequest = linesOfRequest;
        this.requestOptions = {
            method: this._parseMethod(),
            baseURL: this._parseBaseUrl()
        };
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
}
exports.Parser = Parser;
//# sourceMappingURL=parser.js.map