import * as url from 'url';
const { URL, parse } = url;

export const DEBUG_MODE = false;

export const NAME = 'rest-book';

export function validateURL(url: string): boolean {
    const protocols = ['http', 'https'];

    try {
        new URL(url);
        const parsed = parse(url);
        logDebug(parsed.protocol);
        return protocols
            ? parsed.protocol
                ? protocols.map(x => `${x.toLowerCase()}:`).includes(parsed.protocol) 
                    ? true : false
                : false
            : true;
    } catch (err) {
        return false;
    }
}


export function logDebug(item: string | any ) {
    if (DEBUG_MODE) {
        console.log(item);
    }
}