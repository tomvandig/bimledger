import { Component, ComponentAttributeInstance, ComponentAttributeType, NamedComponentAttributeInstance } from "./bl_core";

export function GetExamplePropDefinition()
{
    return {
        id: ["ifc23", "ifcproperty"],
        parent: null,
        ownership: "any",
        schema: {
            attributes: [
                {
                    name: "name",
                    value: {
                        type: ComponentAttributeType.STRING,
                        optional: false,
                        child: null
                    }
                }
            ]
        }
    };
}

export function GetExamplePropSetDefinition()
{
    return {
        id: ["ifc23", "ifcpropertyset"],
        parent: null,
        ownership: "any",
        schema: {
            attributes: [
                {
                    name: "properties",
                    value: {
                        type: ComponentAttributeType.ARRAY,
                        optional: false,
                        child: {
                            type: ComponentAttributeType.REF,
                            optional: false,
                            child: null
                        }
                    }
                }
            ]
        }
    };
}

export function GetExampleObject(ref: number, guid: string | null, def: any, data: NamedComponentAttributeInstance[])
{
    return { ref, hash: "h", guid, type: def.id, data } as Component;
}

/*
    NUMBER,
    STRING,
    ARRAY,
    LABEL,
    REF
*/

export function MakeAttr(name: string, val: ComponentAttributeInstance)
{
    return {name, val} as NamedComponentAttributeInstance;
}

export function MakeNumber(num: number)
{
    return { type: ComponentAttributeType.NUMBER, val: num } as ComponentAttributeInstance;
}

export function MakeRef(num: number)
{
    return { type: ComponentAttributeType.REF, val: num } as ComponentAttributeInstance;
}

export function MakeString(str: String)
{
    return { type: ComponentAttributeType.STRING, val: str } as ComponentAttributeInstance;
}

export function MakeLabel(str: String)
{
    return { type: ComponentAttributeType.LABEL, val: str } as ComponentAttributeInstance;
}

export function MakeArray(a: any[])
{
    return { type: ComponentAttributeType.ARRAY, val: a } as ComponentAttributeInstance;
}