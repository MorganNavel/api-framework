import { Middleware } from "../middleware";
import { HttpMethod } from "../request";
export interface RouteDefinition {
    method: HttpMethod;
    pattern: string;
    handlerName: string | symbol;
    middlewares?: Middleware[];

}

function Controller(route: string): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata("basePattern", route, target);
    }
}
function Route(method: HttpMethod, route: string, middlewares?: Middleware[]): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const routes: RouteDefinition[] = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({
            method,
            pattern: route,
            handlerName: propertyKey,
            middlewares: middlewares
        });
        Reflect.defineMetadata("routes", routes, target.constructor);
        return descriptor;
    };
}

const Get = (route: string, middlewares?: Middleware[]) => Route("GET", route, middlewares);
const Post = (route: string, middlewares?: Middleware[]) => Route("POST", route, middlewares);
const Patch = (route: string, middlewares?: Middleware[]) => Route("PATCH", route, middlewares);
const Put = (route: string, middlewares?: Middleware[]) => Route("PUT", route, middlewares);
const Delete = (route: string, middlewares?: Middleware[]) => Route("DELETE", route, middlewares);


export { Get, Post, Patch, Put, Delete, Controller }
