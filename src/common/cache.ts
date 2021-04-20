import { ResponseParser } from './response';
import { RequestParser } from './request';

export var variableCache: { [key: string]: ResponseParser } = {};
export var baseUrlCache: Set<string> = new Set();

export function getVariableNames(): string[] {
    return Object.keys(variableCache);
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

export function findMatchingVariable(name: string): any | undefined {
    for(let key of Object.keys(variableCache)) {
        if(key === name) { return variableCache[name]; }
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

export function attemptToLoadVariable(text: string): any | undefined {
    let declaration = _createVariableDeclarationsFromCache();
    const tokens = text.split('.');
    let toResolve = ` ${tokens[0]}`;

    for(let i = 1; i < tokens.length; i++) {
        if(tokens[i].includes('-') || tokens[i].includes(' ')) {
            toResolve += `["${tokens[i]}"]`;
        } else {
            toResolve += `.${tokens[i]}`;
        }
    }

    try {
        return eval(declaration + toResolve);
    } catch {
        return undefined;
    }
}

export function attemptToLoadVariableInObject(body: any) {
    _attemptToLoadVariableInObjectHelper(body);
}

function _attemptToLoadVariableInObjectHelper(obj: any) {
    for(let key of Object.keys(obj)) {
        if(typeof obj[key] === 'object') {
            _attemptToLoadVariableInObjectHelper(obj[key]);
        }

        let loadedVariable = attemptToLoadVariable(obj[key]);
        if(loadedVariable) { obj[key] = loadedVariable; }
    }
}

function _createVariableDeclarationsFromCache(): string {
    let ret = '';

    for(let varName of Object.keys(variableCache)) {
        ret += `let ${varName} = ${JSON.stringify(variableCache[varName].renderer())}; `;
    }

    return ret;
}