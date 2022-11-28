
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
                        type: 1, // array
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
                        type: 1, // array
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

let transations: [
    {
        date: "01012020T1930300",
        hash: "xqmw0d83",
        context: "0nc97403",
        author: "bob@office.com",
        delta: {
            definitions: {
                created: [
                    { 
                        id: ["ifc23", "ifccartesianpoint"],
                        parent: null,
                        schema: {
                            coordinates: {
                                type: "ARRAY",
                                elementtype: "NUMBER"
                            }
                        },
                        ownership: {
                            label: "ANY"
                        }
                    }
                ],
                expired: [
                    {
                        id: ["temp", "pointdef"]
                    }
                ]
            },
            components: {
                created: [
                    { ref: 41, hash: "349v023", type: "ifc23::ifccartesianpoint", data: { coordinates: [28, 30, 1] }}
                ],
                modified: [
                    { ref: 42, hash: "c293n8r", type: "ifc23::ifccartesianpoint", data: { coordinates: [5, 298, 83] }}
                ],
                deleted: [40]
            }
        }
    }
]