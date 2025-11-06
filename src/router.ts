import { RouteDefinition } from "./decorator/controller";
import { Middleware } from "./middleware";
import { HttpMethod, HttpRequest } from "./request";
import { HttpResponse } from "./response";

interface Route {
    method: HttpMethod;
    pattern: string;
    controller: (req: HttpRequest, res: HttpResponse) => any;
    middlewares?: Middleware[];

}
export class RouterManager{
    private static _instance?: RouterManager;
    private routes: Route[] = [];
    
    private constructor(){}

    static  getInstance(): RouterManager{
        if(RouterManager._instance) return RouterManager._instance;
        RouterManager._instance = new RouterManager();
        return RouterManager._instance;
    }

    registerRoute(route: Route){
        this.routes.push(route);
    }

    registerController(controllerClass: any, controllerInstance: any){
        const basePattern: string = Reflect.getMetadata("basePattern", controllerClass) || "";
        const routes : RouteDefinition[] = Reflect.getMetadata("routes", controllerClass) || [];
        for(const route of routes){
            this.routes.push({
                method: route.method,
                pattern: basePattern+ route.pattern,
                controller: controllerInstance[route.handlerName].bind(controllerInstance),
                middlewares: route.middlewares
            });
        }
    }

    findRoute(url: string, method: HttpMethod){
        return this.routes.find(r => r.method === method && this.matchUrl(r.pattern, url));
    }

    matchUrl(pattern: string, url: string): boolean {
        const splitPattern = pattern.split('/').filter(Boolean);
        const splitUrl = url.split('/').filter(Boolean);
        if(splitPattern.length !== splitUrl.length) return false;
        for(let i = 0; i<splitPattern.length;i++){
            if (splitPattern[i].startsWith(":")) continue;
            if(splitPattern[i] !== splitUrl[i]) return false;
        }
        return true;
    }
    extractParams(req: HttpRequest, pattern: string) {
        const url = req.url;
        const params : Record<string, string> = {};
        const splitPattern = pattern.split('/').filter(Boolean);
        const splitUrl = url.split('/').filter(Boolean);
        for(let i = 0; i<splitPattern.length;i++){
            if (splitPattern[i].startsWith(":")) {
                params[splitPattern[i].slice(1)] = splitUrl[i];
            };
        }
        req.setParams(params);
    }
}