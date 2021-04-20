import { ResponseParser } from './response';
import { RequestParser } from './request';
export declare var variableCache: {
    [key: string]: ResponseParser;
};
export declare var baseUrlCache: Set<string>;
export declare function updateCache(request: RequestParser, response: ResponseParser): void;
export declare function getVariableNames(): string[];
export declare function getBaseUrls(): string[];
