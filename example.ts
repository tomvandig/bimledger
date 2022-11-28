
export let ECS1 = {
    definitions: [{
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
    }],
    components: [
        { ref: 41, hash: "349v023", guid: "1", type: ["ifc23", "ifccartesianpoint"], data: { coordinates: [28, 30, 1] }},
        { ref: 42, hash: "349v023", guid: "2", type: ["ifc23", "ifccartesianpoint"], data: { coordinates: [28, 30, 2] }},
        { ref: 43, hash: "349v023", guid: "3", type: ["ifc23", "ifccartesianpoint"], data: { coordinates: [28, 30, 3] }}
    ]
};

export let ECS2 = {
    definitions: [{
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
    }],
    components: [
        { ref: 41, hash: "349v024", guid: "1", type: ["ifc23", "ifccartesianpoint"], data: { coordinates: [28, 30, 4] }},
        { ref: 42, hash: "349v024", guid: "2", type: ["ifc23", "ifccartesianpoint"], data: { coordinates: [28, 30, 5] }},
        { ref: 44, hash: "349v023", guid: "4", type: ["ifc23", "ifccartesianpoint"], data: { coordinates: [28, 30, 6] }}
    ]
};