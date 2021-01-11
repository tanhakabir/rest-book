import { logDebug } from './common';
import { ResponseHeaderField } from './httpConstants';

export class ResponseParser {
    private status: number| undefined;
    private statusText: string | undefined;
    private headers: any | undefined;
    private config: any | undefined;
    private request: any | undefined;
    private data: any | undefined;

    constructor(response: any) {
        logDebug(response);
        let res = response;

        if(response.response && response.status === undefined) {
            res = response.response;
        }

        try {
            this.status = res.status;
            this.statusText = res.statusText;

            // cyclical reference so we need to cherry pick fields
            this.headers = {};

            for(const field of Object.values(ResponseHeaderField)) {
                this.headers[field] = res.headers[field.toLowerCase()];
            }

            this.config = {
                timeout: res.config.timeout,
                xsrfCookieName: res.config.xsrfCookieName,
                xsrfHeaderName: res.config.xsrfHeaderName,
                headers: res.config.headers
            };

            this.request = {
                method: res.request.method,
                res: {
                    httpVersion:  res.request.res.httpVersion,
                    responseUrl: res.request.res.responseUrl
                }
            };

            this.data = res.data;
        } catch {
            throw new Error(response.message);
        }
    }

    parse() {
        return {
            "application/json": {
                status: this.status,
                statusText: this.statusText,
                headers: this.headers,
                config: this.config,
                request: this.request,
                data: this.data
            },
            "text/html": this.data
        };
    };
}