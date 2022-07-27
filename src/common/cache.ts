import { ResponseParser } from './response';
import { RequestParser } from './request';
import { SECRETS, hasNoSecrets } from './secrets';

import { JSONPath } from 'jsonpath-plus';

export var variableCache: { [key: string]: ResponseParser | any } = {};
export var baseUrlCache: Set<string> = new Set();

export function getVariableNames(): string[] {
    let varCacheKeys: string[] = Object.keys(variableCache);
    if(!hasNoSecrets()) { varCacheKeys.push('SECRETS'); }
    return varCacheKeys;
}

export function findMatchingDataInVariableCache(varName: string, cache: any): any | undefined {
    for(let key of Object.keys(cache)) {
        if(key === varName) { return cache[key]; }

        if(typeof cache[key] === 'object') {
            return findMatchingDataInVariableCache(varName, cache[key]);
        }
    }

    return undefined;
}

export function getBaseUrls(): string[] {
    return [...baseUrlCache];
}

export function updateCache(request: RequestParser, response: ResponseParser ){
    let url = request.getBaseUrl();
    if(url) {
        baseUrlCache.add(url);
    }

    let varName = request.getVariableName();
    if(!varName) { return; }

    variableCache[varName] = response;
}

export function addToCache(name: string, value: any) {
    variableCache[name] = value;
}

export function attemptToLoadVariable(text: string): any | undefined {

    let data = JSONPath(
        {
            json: variableCache,
            path: `$.${text}`,
            wrap: false
        });
    
    return data ?? undefined;

}
