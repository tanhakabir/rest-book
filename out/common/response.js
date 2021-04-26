import { logDebug } from './common';
import { ResponseHeaderField } from './httpConstants';
import * as secrets from './secrets';
export class ResponseParser {
    constructor(response, request, reqParser) {
        logDebug(response);
        this.reqParser = reqParser;
        let res = response;
        if (response.response && response.status === undefined) {
            res = response.response;
        }
        try {
            this.status = res.status;
            this.statusText = res.statusText;
            // cyclical reference so we need to cherry pick fields
            this.headers = {};
            for (const field of Object.values(ResponseHeaderField)) {
                this.headers[field] = res.headers[field.toLowerCase()];
            }
            this.config = {
                timeout: res.config.timeout,
                xsrfCookieName: res.config.xsrfCookieName,
                xsrfHeaderName: res.config.xsrfHeaderName,
                headers: res.config.headers
            };
            delete request.method;
            delete request.baseURL;
            delete request.url;
            this.request = {
                method: res.request.method,
                httpVersion: res.request.res.httpVersion,
                responseUrl: res.request.res.responseUrl
            };
            this.request = { ...this.request, ...request };
            this.data = res.data;
            this._cleanForSecrets();
        }
        catch {
            throw new Error(response.message);
        }
    }
    json() {
        return {
            status: this.status,
            statusText: this.statusText,
            headers: this.headers,
            config: this.config,
            request: this.request,
            data: this.data
        };
    }
    html() {
        return this.data;
    }
    renderer() {
        if (!this.status || !this.statusText || this.data === undefined) {
            throw new Error("Corrupt response received! Missing one or more of response status, status text, and/or data!");
        }
        return {
            status: this.status,
            statusText: this.statusText,
            headers: this.headers,
            config: this.config,
            request: this.request,
            data: this.data
        };
    }
    _cleanForSecrets() {
        try {
            // only need to clean config and request
            if (this.request.responseUrl && this.reqParser.wasReplacedBySecret(this.request.responseUrl)) {
                this.request.responseUrl = secrets.cleanForSecrets(this.request.responseUrl);
            }
            if (this.request.data && typeof this.request.data === 'string' && this.reqParser.wasReplacedBySecret(this.request.data)) {
                this.request.data = secrets.cleanForSecrets(this.request.data);
            }
            if (this.request.headers && typeof this.request.headers === 'object') {
                for (let key of Object.keys(this.request.headers)) {
                    if (this.reqParser.wasReplacedBySecret(this.request.headers[key])) {
                        this.request.headers[key] = secrets.cleanForSecrets(this.request.headers[key]);
                    }
                }
            }
            if (this.request.params && typeof this.request.params === 'object') {
                for (let key of Object.keys(this.request.params)) {
                    if (this.reqParser.wasReplacedBySecret(this.request.params[key])) {
                        this.request.params[key] = secrets.cleanForSecrets(this.request.params[key]);
                    }
                }
            }
            if (this.config.headers && typeof this.config.headers === 'object') {
                for (let key of Object.keys(this.config.headers)) {
                    if (this.reqParser.wasReplacedBySecret(this.config.headers[key])) {
                        this.config.headers[key] = secrets.cleanForSecrets(this.config.headers[key]);
                    }
                }
            }
            else if (this.config.headers && typeof this.config.headers === 'string' && this.reqParser.wasReplacedBySecret(this.config.headers)) {
                this.config.headers = secrets.cleanForSecrets(this.config.headers);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
}
//# sourceMappingURL=response.js.map