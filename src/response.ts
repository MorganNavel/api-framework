import { ServerResponse } from "http";
export class HttpResponse {
  private _statusCode = 200;
  private _headers: Record<string, string> = {};
  private _body: string = "";

  status(statusCode: number): this {
    this._statusCode = statusCode;
    return this;
  }

  header(key: string, value: string): this {
    this._headers[key.toLowerCase()] = value;
    return this;
  }

  json(body: Record<string, any>): this {
    this._headers["content-type"] = "application/json";
    this._body = JSON.stringify(body);
    return this;
  }

  send(body: string | Record<string, any>): this {
    if (typeof body === "object") {
      this.json(body);
    } else {
      this._body = body;
      if (!this._headers["content-type"]) {
        this._headers["content-type"] = "text/plain";
      }
    }
    return this;
  }

  applyTo(res: ServerResponse) {
    res.writeHead(this._statusCode, this._headers);
    res.end(this._body);
  }
}
