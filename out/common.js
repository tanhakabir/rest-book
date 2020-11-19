"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = exports.validateURL = exports.DEBUG_MODE = void 0;
const url_1 = require("url");
exports.DEBUG_MODE = false;
function validateURL(url) {
    const protocols = ['http', 'https'];
    try {
        new url_1.URL(url);
        const parsed = url_1.parse(url);
        logDebug(parsed.protocol);
        return protocols
            ? parsed.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(parsed.protocol)
                    ? true : false
                : false
            : true;
    }
    catch (err) {
        return false;
    }
}
exports.validateURL = validateURL;
function logDebug(item) {
    if (exports.DEBUG_MODE) {
        console.log(item);
    }
}
exports.logDebug = logDebug;
//# sourceMappingURL=common.js.map