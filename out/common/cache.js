export var variableCache = {};
export var baseUrlCache = new Set();
export function getVariableNames() {
    return Object.keys(variableCache);
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
    console.log(variableCache);
}
export function attemptToLoadVariable(text) {
    let toResolve = _createVariableDeclarationsFromCache();
    toResolve += ` ${text}`;
    try {
        return eval(toResolve);
    }
    catch {
        return undefined;
    }
}
export function attemptToLoadVariableInObject(body) {
    return _attemptToLoadVariableInObjectHelper(body);
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
        ret += `let ${varName} = ${JSON.stringify(variableCache[varName].renderer())}; `;
    }
    return ret;
}
//# sourceMappingURL=cache.js.map