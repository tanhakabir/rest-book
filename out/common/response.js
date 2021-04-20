import { logDebug } from './common';
import { ResponseHeaderField } from './httpConstants';
export class ResponseParser {
    constructor(response, request) {
        logDebug(response);
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
        if (!this.status || !this.statusText || !this.data) {
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
    cache() {
    }
}
//# sourceMappingURL=response.js.map