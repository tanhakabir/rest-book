export const DEBUG_MODE = false;
export const NAME = 'ml-feed';
export const MIME_TYPE = 'x-application/ml-feed';
export function formatURL(url) {
    if (!url.startsWith('http')) {
        return `http://${url}`;
    }
    return url;
}
export function logDebug(item) {
    if (DEBUG_MODE) {
        console.log(item);
    }
}
//# sourceMappingURL=common.js.map