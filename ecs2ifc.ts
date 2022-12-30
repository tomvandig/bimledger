import { AttributeValue, Component, ComponentAttributeInstance, ComponentAttributeType, ECS, NamedComponentAttributeInstance } from "./bl_core";

function ExportComponentValueToString(attrInstance: ComponentAttributeInstance)
{
    switch(attrInstance.type)
    {
        case ComponentAttributeType.NUMBER:
        case ComponentAttributeType.LABEL:
        case ComponentAttributeType.BOOLEAN:
        case ComponentAttributeType.BINARY:
        case ComponentAttributeType.LOGICAL:
            return `${attrInstance.val}`;
        case ComponentAttributeType.STRING:
            return `'${attrInstance.val}'`;
        case ComponentAttributeType.REF:
            return `#${attrInstance.val}`;
        case ComponentAttributeType.SELECT:
            throw new Error(`Unexpected select while exporting to IFC`);
        case ComponentAttributeType.ARRAY:
            {
                let arr = attrInstance.val as ComponentAttributeInstance[];
                let arrString = arr.map((instance) => ExportComponentValueToString(instance)).join(",");
                return `(${arrString})`;
            }
        default:
            throw new Error(`Unexpected type while exporting to IFC`);
    }
}

function ExportComponentDataToString(componentData: NamedComponentAttributeInstance[])
{
    return componentData.map((attrInstance) => {
        // don't care about the name, thats only relevant for the schema
        return ExportComponentValueToString(attrInstance.val);
    }).join(",");
}

function ExportComponentToString(comp: Component): string
{
    let ifcTypeAsString = comp.type[1].toLocaleUpperCase();
    return `#${comp.ref}=${ifcTypeAsString}(${ExportComponentDataToString(comp.data)});`;
}

export default function ExportToIfc(ecs: ECS, ids: number[] | null)
{
    
    // ignore definitions, these are implied 
    
    // TODO: slow
    // TODO: filter on type IFC
    let componentsToExport: Component[] = ids ? ids.map((id) => ecs.GetComponentByRef(id)) : ecs.components;

    // TODO: header

    let exportedStepArray: string[] = componentsToExport.map((comp) => ExportComponentToString(comp));

    return exportedStepArray.join("\n");
}
