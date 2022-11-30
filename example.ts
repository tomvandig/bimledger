
export function GetExampleDefinition()
{
    return {
        id: ["ifc23", "ifccartesianpoint"],
        parent: null,
        ownership: "any",
        schema: {
            attributes: [
                {
                    name: "coordinates",
                    value: {
                        type: 2, // array
                        child: {
                            type: 0, // number   
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