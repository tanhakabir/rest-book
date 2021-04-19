import { ResponseParser } from './response';
import { RequestParser } from './request';
export declare var cache: {
    [key: string]: ResponseParser;
};
export declare function updateCache(_request: RequestParser, _response: ResponseParser): void;
