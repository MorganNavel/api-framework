export class IocContainer {
    private instances = new Map(); 
    constructor(){}

    resolve(cls: any, stack: any[] = []){
        if (stack.includes(cls)) {
            throw new Error(`Circular dependency detected: ${[...stack, cls].map(c => c.name).join(" -> ")}`);
        }        
        const entry = this.instances.get(cls);
        if(entry) return entry;
        const instance = new cls();
        stack.push(cls);
        this.instances.set(cls, instance);
        const deps = Reflect.getMetadata("autowired:props", cls) || [];

        for(const { propertyKey, type } of deps){
            if(!type) {
                stack.pop();
                throw new Error(`Circular dependency detected: ${[...stack, cls].map(c => c.name).join(" -> ")}`);
            }
            instance[propertyKey] = this.resolve(type, stack);
        }
        stack.pop();
        return instance;
    }
}

