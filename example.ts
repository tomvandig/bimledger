import { ComponentAttributeType } from "./bl_cli";

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
                        child: {
                            type: ComponentAttributeType.REF,
                            child: null
                        }
                    }
                }
            ]
        }
    };
}

export function GetExampleObject(ref: number, guid: string | null, def: any, data: any)
{
    return { ref, hash: "h", guid, type: def.id, data };
}

/*
    NUMBER,
    STRING,
    ARRAY,
    LABEL,
    REF
*/

export function MakeNumber(num: number)
{
    return num;
}

export function MakeRef(num: number)
{
    return num;
}

export function MakeString(str: String)
{
    return str;
}

export function MakeLabel(str: String)
{
    return str;
}

export function MakeArray(a: any[])
{
    return a;
}