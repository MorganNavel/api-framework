import { HttpMethod } from "../request";
export interface RouteDefinition {
    method: HttpMethod;
    pattern: string;
    handlerName: string | symbol;
}

function Controller(route: string): ClassDecorator {
    return (target) => {
        Reflect.defineMetadata("basePattern", route, target);
    }
}
function Route(method: HttpMethod, route: string): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const routes: RouteDefinition[] = Reflect.getMetadata("routes", target.constructor) || [];
        routes.push({
            method,
            pattern: route,
            handlerName: propertyKey
        });
        Reflect.defineMetadata("routes", routes, target.constructor);
        return descriptor;
    };
}

const Get = (route: string) => Route("GET", route);
const Post = (route: string) => Route("POST", route);
const Patch = (route: string) => Route("PATCH", route);
const Put = (route: string) => Route("PUT", route);
const Delete = (route: string) => Route("DELETE", route);


export { Get, Post, Patch, Put, Delete, Controller }
