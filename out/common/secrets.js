var stringify = require('json-stringify-safe');
const SECRETS_KEY = 'rest-book-secrets';
var extContext;
var secrets = {};
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
//# sourceMappingURL=secrets.js.map