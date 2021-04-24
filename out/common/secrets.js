var stringify = require('json-stringify-safe');
const SECRETS_KEY = 'rest-book-secrets';
var extContext;
export var SECRETS = {};
export function hasNoSecrets() {
    return Object.keys(SECRETS).length === 0;
}
export function initializeSecretsRegistry(context) {
    extContext = context;
    context.secrets.get(SECRETS_KEY).then((contents) => {
        try {
            SECRETS = JSON.parse(contents);
        }
        catch {
            SECRETS = {};
        }
    });
}
export function getNamesOfSecrets() {
    return Object.keys(SECRETS);
}
export function getSecret(name) {
    return SECRETS[name];
}
export function addSecret(name, value) {
    SECRETS[name] = value;
    _saveSecrets();
}
export function deleteSecret(name) {
    delete SECRETS[name];
    _saveSecrets();
}
function _saveSecrets() {
    extContext.secrets.store(SECRETS_KEY, stringify(SECRETS));
}
export function cleanForSecrets(text) {
    if (typeof text === 'string') {
        let ret = text;
        for (let key of Object.keys(SECRETS)) {
            ret = ret.replace(SECRETS[key], `[SECRET ${key}]`);
        }
        return ret;
    }
    if (typeof text === 'number') {
        for (let key of Object.keys(SECRETS)) {
            if (text === SECRETS[key]) {
                return `[SECRET ${key}]`;
            }
        }
    }
    return text;
}
//# sourceMappingURL=secrets.js.map