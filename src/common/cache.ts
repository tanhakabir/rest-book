import { ResponseParser } from './response';
import { RequestParser } from './request';

export var cache: { [key: string]: ResponseParser } = {};

export function updateCache(_request: RequestParser, _response: ResponseParser ){

}