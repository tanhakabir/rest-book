import { ResponseParser } from './response';
import { RequestParser } from './request';

export var variableCache: { [key: string]: ResponseParser } = {};
export var baseUrlCache: Set<string> = new Set();

export function getVariableNames(): string[] {
    return Object.keys(variableCache);
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
    console.log(variableCache);
}

export function attemptToLoadVariable(text: string): any | undefined {
    let toResolve = _createVariableDeclarationsFromCache();
    toResolve += ` ${text}`;

    try {
        return eval(toResolve);
    } catch {
        return undefined;
    }
}

export function attemptToLoadVariableInObject(body: any): any {
    return _attemptToLoadVariableInObjectHelper(body);
}

function _attemptToLoadVariableInObjectHelper(obj: any): any {
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