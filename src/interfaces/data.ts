import { IncomingHttpHeaders } from "node:http";
import { ParsedUrlQuery } from "node:querystring";

export interface IData {
    trimmedPath: string;
    queryStringObject: ParsedUrlQuery;
    method: string;
    headers: IncomingHttpHeaders;
    payload: any;
  }