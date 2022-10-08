export const DEBUG_MODE = false;

export const NAME = 'rest-book';
export const MIME_TYPE = 'x-application/rest-book';


export function formatURL(url: string): string {
    if (!url.startsWith('http')) {
        return `http://${url}`;
    }

    return url;
}


export function logDebug(item: string | any) {
    if (DEBUG_MODE) {
        console.log(item);
    }
}