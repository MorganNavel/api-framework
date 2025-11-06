import { IncomingMessage } from 'http';
import { parse } from 'url';
import { urlencoded } from './utils/urlencoded';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface HttpRequestInit {
    url: string;
    method: HttpMethod;
    headers?: HttpHeaders;
    params?: HttpParams;
    body?: HttpBody;
    query?: Record<string, any>
}
type ContentType = "application/x-www-form-urlencoded" | "application/json" | "multipart/form-data" | "text/plain";
export class HttpRequest {
    readonly url: string;
    readonly method: HttpMethod;
    readonly headers: HttpHeaders;
    params: HttpParams = {};
    readonly query?: Record<string, string>;
    readonly rawBody?:  string;
    body: any;

    constructor(ctx : HttpRequestInit){
        if(!ctx.method) throw 'Error: "method" parameter not declared';
        this.url = ctx.url;
        this.headers = this._normalizeHeaders(ctx.headers);
        this.method = ctx.method;
        if(this.method == 'GET' && ctx.body) throw 'Error: method "GET" should not have a body';
        this.rawBody = ctx.body;
        this.query = ctx.query;
        
        if(this.headers["content-type"] && ctx.body){
            this._parseBody(this.headers, ctx.body)
        }
    }

    private _parseBody(headers: HttpHeaders, body: any){
        const contentType = headers["content-type"] as ContentType;
        switch(contentType) {
            case "application/json":
                this.body = JSON.parse(body);
                break;
            case "application/x-www-form-urlencoded":
                this.body = urlencoded(body);
                break;
            case "text/plain":
                this.body = body.toString();
                break;
            default:
                throw new Error("Not supported yet");
        }

    }
    private _normalizeHeaders(headers?: HttpHeaders){
        const normalized: HttpHeaders = {};
        for (const key in headers ?? {}) {
            normalized[key.toLowerCase()] = headers![key];
        }
        return normalized;
    }
    setParams(params: Record<string, string>){
        this.params = params;
    }
}

export type HttpHeaders = Record<string, string | string[]>;

export type HttpParams = Record<string, string>;

export type HttpBody = string;


export class HttpRequestFactory {
    static async fromHttpNodeRequest(req: IncomingMessage) : Promise<HttpRequest> {
        const { pathname, query } = parse(req.url ?? '', true);
        const validMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        if (!req.method || !validMethods.includes(req.method as HttpMethod)) {
            throw new Error(`Invalid HTTP method: ${req.method}`);
        }
        const rawBody = await readBody(req);
        const requestInit: HttpRequestInit = {
            url: pathname ?? '/',
            query: query,
            method: req.method as HttpMethod,
            headers: req.headers as HttpHeaders,
            body: rawBody
        };
        return new HttpRequest(requestInit);
    }
}

async function readBody(req: IncomingMessage) : Promise<string> {
    return new Promise((resolve, reject) => {
        let body = "";
        req.on("data", chunk => {
            body += chunk;
        });
        req.on("end", () => resolve(body));
        req.on("error", e => reject(e));
    });
    
}