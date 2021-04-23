const SECRETS_KEY = 'rest-book-secrets';
var extContext;
var secrets = {};
export function initialize(context) {
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
//# sourceMappingURL=secrets.js.map