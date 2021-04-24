var stringify = require('json-stringify-safe');
const SECRETS_KEY = 'rest-book-secrets';
var extContext;
export var secrets = {};
export function hasNoSecrets() {
    return Object.keys(secrets).length === 0;
}
export function initializeSecretsRegistry(context) {
    extContext = context;
    context.secrets.get(SECRETS_KEY).then((contents) => {
        try {
            secrets = JSON.parse(contents);
        }
        catch {
            secrets = {};
        }
    });
}
export function getNamesOfSecrets() {
    return Object.keys(secrets);
}
export function getSecret(name) {
    return secrets[name];
}
export function addSecret(name, value) {
    secrets[name] = value;
    _saveSecrets();
}
export function deleteSecret(name) {
    delete secrets[name];
    _saveSecrets();
}
function _saveSecrets() {
    extContext.secrets.store(SECRETS_KEY, stringify(secrets));
}
export function cleanForSecrets(text) {
    if (typeof text === 'string') {
        let ret = text;
        for (let key of Object.keys(secrets)) {
            ret = ret.replace(secrets[key], `[SECRET ${key}]`);
        }
        return ret;
    }
    if (typeof text === 'number') {
        for (let key of Object.keys(secrets)) {
            if (text === secrets[key]) {
                return `[SECRET ${key}]`;
            }
        }
    }
    return text;
}
//# sourceMappingURL=secrets.js.map