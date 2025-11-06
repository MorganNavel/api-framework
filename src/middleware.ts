import { HttpRequest } from "./request";
import { HttpResponse } from "./response";

export type Middleware = (req: HttpRequest, res: HttpResponse, next: () => void) => void;
