export interface Request {
    url?: string | undefined;
    method: string;
    baseURL: string;
    headers?: any | undefined;
    params?: any | undefined;
    data?: string | any | undefined;
    timeout?: number | undefined;
    withCredentials?: boolean | false;
    auth?: any | undefined;
    responseType?: string | undefined;
    responseEncoding?: string | undefined;
    xsrfCookieName?: string | undefined;
    xsrfHeaderName?: string | undefined;
    maxContentLength?: number | undefined;
    maxBodyLength?: number | undefined;
    maxRedirects?: number | undefined;
    socketPath?: any | undefined;
    proxy?: any | undefined;
    decompress?: boolean | true;
}
export declare class RequestParser {
    private originalRequest;
    private requestOptions;
    private baseUrl?;
    private variableName;
    private valuesReplacedBySecrets;
    constructor(query: string);
    getRequest(): any;
    getBaseUrl(): string | undefined;
    getVariableName(): string | undefined;
    wasReplacedBySecret(text: string): boolean;
    private _parseVariableName;
    private _stripVariableDeclaration;
    private _parseMethod;
    private _parseBaseUrl;
    private _parseQueryParams;
    private _parseHeaders;
    private _parseBody;
    private _attemptToLoadFile;
    private _attemptToLoadVariable;
    private _getEndOfWordIndex;
}
