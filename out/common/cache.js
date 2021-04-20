export var variableCache = {};
export var baseUrlCache = new Set();
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
export function getVariableNames() {
    return Object.keys(variableCache);
}
export function getBaseUrls() {
    return [...baseUrlCache];
}
//# sourceMappingURL=cache.js.map