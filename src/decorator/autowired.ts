import "reflect-metadata";
export function Autowired(getType?: () => any): PropertyDecorator {
  return (target, propertyKey) => {
    const type = getType
      ? getType()
      : Reflect.getMetadata("design:type", target, propertyKey);
    const existing =
      Reflect.getMetadata("autowired:props", target.constructor) || [];
    existing.push({ propertyKey, type });
    Reflect.defineMetadata("autowired:props", existing, target.constructor);
  };
}