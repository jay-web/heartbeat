import { ParsedUrlQuery } from "node:querystring";

export interface IData {
    'trimmedPath': string,
    'queryStringObject': ParsedUrlQuery,
    'method': string,
    'headers': string,
    'payload': string
}