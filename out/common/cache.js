import { ResponseParser } from './response';
import { SECRETS, hasNoSecrets } from './secrets';
var stringify = require('json-stringify-safe');
export var variableCache = {};
export var baseUrlCache = new Set();
export function getVariableNames() {
    let varCacheKeys = Object.keys(variableCache);
    if (!hasNoSecrets()) {
        varCacheKeys.push('SECRETS');
    }
    return varCacheKeys;
}
export function findMatchingDataInVariableCache(varName, cache) {
    for (let key of Object.keys(cache)) {
        if (key === varName) {
            return cache[key];
        }
        if (typeof cache[key] === 'object') {
            return findMatchingDataInVariableCache(varName, cache[key]);
        }
    }
    return undefined;
}
export function getBaseUrls() {
    return [...baseUrlCache];
}
export function updateCache(request, response) {
    let url = request.getBaseUrl();
    if (url) {
        baseUrlCache.add(url);
    }
    let varName = request.getVariableName();
    if (!varName) {
        return;
    }
    variableCache[varName] = response;
}
export function addToCache(name, value) {
    variableCache[name] = value;
}
export function attemptToLoadVariable(text) {
    let declaration = _createVariableDeclarationsFromCache();
    const tokens = text.split('.');
    let toResolve = ` ${tokens[0]}`;
    for (let i = 1; i < tokens.length; i++) {
        if (tokens[i].includes('-') || tokens[i].includes(' ')) {
            toResolve += `["${tokens[i]}"]`;
        }
        else {
            toResolve += `.${tokens[i]}`;
        }
    }
    try {
        return eval(declaration + toResolve);
    }
    catch {
        return undefined;
    }
}
export function attemptToLoadVariableInObject(body) {
    _attemptToLoadVariableInObjectHelper(body);
}
function _attemptToLoadVariableInObjectHelper(obj) {
    for (let key of Object.keys(obj)) {
        if (typeof obj[key] === 'object') {
            _attemptToLoadVariableInObjectHelper(obj[key]);
        }
        let loadedVariable = attemptToLoadVariable(obj[key]);
        if (loadedVariable) {
            obj[key] = loadedVariable;
        }
    }
}
function _createVariableDeclarationsFromCache() {
    let ret = '';
    for (let varName of Object.keys(variableCache)) {
        if (variableCache[varName] instanceof ResponseParser) {
            ret += `let ${varName} = ${stringify(variableCache[varName].renderer())}; `;
        }
        else {
            ret += `let ${varName} = ${stringify(variableCache[varName])}; `;
        }
    }
    if (!hasNoSecrets()) {
        ret += `let SECRETS = ${stringify(SECRETS)}; `;
    }
    return ret;
}
//# sourceMappingURL=cache.js.map