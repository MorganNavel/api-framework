import "reflect-metadata";
import { HttpRequest, HttpRequestFactory } from "./request";
import { HttpResponse } from "./response";
import { RouterManager } from "./router";
import http from "http";
import { readdirSync, statSync } from "fs";
import path from 'path';
import { IocContainer } from "./ioc_container";

export class App {
    private static _instance: App;
    private ctx: IocContainer = new IocContainer();
    routerManager: RouterManager = RouterManager.getInstance();
    private static PORT = 3000;
    private constructor(){}
    private static getInstance(){
        if(!App._instance) App._instance = new App();
        return App._instance
    }
    private loadControllers(dir: string){
        const files = readdirSync(dir)
        for(const file of files) {
            const fullPath = path.join(dir, file);
            const stat = statSync(fullPath);
            if(stat.isDirectory()){
                this.loadControllers(fullPath);
            } else if(file.endsWith('.controller.ts') || file.endsWith('.controller.js')){
                console.log(`Controller found : ${fullPath}`);
                const controllerModule = require(fullPath);
                Object.values(controllerModule).forEach((ControllerClass: any) => {
                    const controllerInstance = App._instance.ctx.resolve(ControllerClass)
                    RouterManager.getInstance().registerController(ControllerClass, controllerInstance);
                });
            }

        }

    }
    

    static run(){
        this.getInstance();
        App._instance.loadControllers(__dirname);
        const server = http.createServer(async (req, res) => {
            const request : HttpRequest = await HttpRequestFactory.fromHttpNodeRequest(req);
            const response = new HttpResponse();
            try {
                console.log(request);
                console.log(RouterManager.getInstance());
                const route = RouterManager.getInstance().findRoute(request.url, request.method);
                if(!route)
                    return response.status(404).applyTo(res);
                RouterManager.getInstance().extractParams(request, route?.pattern);
                route.controller(request, response);
                return response.applyTo(res);
            } catch {
                return response.status(501).applyTo(res);
            }

        });
        server.listen(this.PORT, () => {
            console.log(`Server is running on ${this.PORT}`);
        });
    }
}