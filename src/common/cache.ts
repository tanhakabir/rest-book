import { ResponseParser } from './response';
import { RequestParser } from './request';

export var variableCache: { [key: string]: ResponseParser } = {};
export var baseUrlCache: Set<string> = new Set();

export function updateCache(request: RequestParser, response: ResponseParser ){
    let url = request.getBaseUrl();
    if(url) {
        baseUrlCache.add(url);
    }

    let varName = request.getVariableName();
    if(!varName) { return; }

    variableCache[varName] = response;
    console.log(variableCache);
}

export function getVariableNames(): string[] {
    return Object.keys(variableCache);
}

export function getBaseUrls(): string[] {
    return [...baseUrlCache];
}