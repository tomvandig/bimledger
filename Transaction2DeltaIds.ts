import { BuildReferenceTree, ComponentType, ComponentTypeToString, ECS, GetRefsFromComponent, ReferenceTree, Transaction } from "./bl_core";

function FindRefsDownward(id: number, ecs: ECS, deltaIds: number[], processed: {}, typeIsIfcProduct: {} | null = null)
{
    let comp = ecs.GetComponentByRef(id);

    if (!comp) return;

    if (typeIsIfcProduct && typeIsIfcProduct[ComponentTypeToString(comp.type)])
    {
        return;
    }

    let refs = GetRefsFromComponent(comp);
    
    refs.forEach((ref) => {
        if (!processed[ref])
        {
            deltaIds.push(ref);
            processed[ref] = true;
            FindRefsDownward(ref, ecs, deltaIds, processed, typeIsIfcProduct);
        }
    })
}

function FindIfcProductForComponent(id: number, ecs: ECS, refTree: ReferenceTree, ifcProductRefs: number[], typeIsIfcProduct: any)
{
    let comp = ecs.GetComponentByRef(id);

    if (!comp)
    {
        throw new Error(`Couldn't find component for id ${id}`);
    }

    if (typeIsIfcProduct[ComponentTypeToString(comp.type)])
    {
        ifcProductRefs.push(id);

        // stop search here
        return;
    }

    let bwdRefs = refTree.bwdRefs[id];

    if (bwdRefs)
    {
        bwdRefs.forEach((ref) => {
            FindIfcProductForComponent(ref, ecs, refTree, ifcProductRefs, typeIsIfcProduct);
        });
    }
}

function dedupe(objs: any[])
{
    let map = {};
    objs.forEach((d) => map[d] = true);
    return Object.keys(map);
}

function dedupeNumbers(objs: any[])
{
    return dedupe(objs).map((k) => parseInt(k));
}

function GetIdsOfType(ecs: ECS, type: ComponentType)
{
    let ids = [];
    ecs.components.forEach((comp) => {
        if (comp.type[1] === type[1])
        {
            ids.push(comp.ref);
        }
    });
    return ids;
}

export function ExportTransactionAsDeltaIds(transaction: Transaction, ecs: ECS)
{
    // TODO: use guids of ifcproduct here, won't work otherwise unless we trim the transaction further

    let typeIsIfcProduct = {};
    ecs.definitions.forEach((def) => {
        typeIsIfcProduct[ComponentTypeToString(def.id)] = def.isEntity;
    })

    let deltaIds: number[] = [];
    let processed = {};

    // gather relevant ids from transaction
    let relevantTopLevelIds: number[] = [];


    let refTree = BuildReferenceTree(ecs);

    transaction.delta.components.added.forEach((comp) => {
        relevantTopLevelIds.push(comp.ref);
        deltaIds.push(comp.ref);
    });

    transaction.delta.components.modified.forEach((comp) => {
        relevantTopLevelIds.push(comp.ref);
        deltaIds.push(comp.ref);
    });

    let ifcProducts = [];
    relevantTopLevelIds.forEach((id) => {
        //FindRefsDownward(id, ecs, deltaIds, processed);
        let comp = ecs.GetComponentsByRef(id);
        let products = [];
        FindIfcProductForComponent(id, ecs, refTree, products, typeIsIfcProduct);
        // console.log(comp, products);
        ifcProducts = [...ifcProducts, ...products];
    });

    ifcProducts = dedupeNumbers(ifcProducts);

    let projects = GetIdsOfType(ecs, ["ifc2x3", "ifcproject"]);
    let sites = GetIdsOfType(ecs, ["ifc2x3", "ifcsite"]);
    let buildings = GetIdsOfType(ecs, ["ifc2x3", "ifcbuilding"]);
    let stories = GetIdsOfType(ecs, ["ifc2x3", "ifcbuildingstorey"]);
    let containedInSpatial = GetIdsOfType(ecs, ["ifc2x3", "ifcrelcontainedinspatialstructure"]);
    let aggregates = GetIdsOfType(ecs, ["ifc2x3", "ifcrelaggregates"]);

    sites.forEach((site) => {
        deltaIds.push(site);
        FindRefsDownward(site, ecs, deltaIds, processed);
    })

    buildings.forEach((building) => {
        deltaIds.push(building);
        FindRefsDownward(building, ecs, deltaIds, processed);
    })
    
    stories.forEach((story) => {
        deltaIds.push(story);
        FindRefsDownward(story, ecs, deltaIds, processed);
    })
    
    containedInSpatial.forEach((cip) => {
        deltaIds.push(cip);
    })
    
    aggregates.forEach((aggr) => {
        deltaIds.push(aggr);
    })

    projects.forEach((proj) => {
        deltaIds.push(proj);
        FindRefsDownward(proj, ecs, deltaIds, processed);
    })

    ifcProducts.forEach((id) => {
        deltaIds.push(id);
        processed[id] = true;
        FindRefsDownward(id, ecs, deltaIds, processed);
    });
    

    /*
    let dcopy = [...deltaIds];
    dcopy.forEach((product) => {
        let bwdRefs = refTree.bwdRefs[product];

        if (!bwdRefs) return;

        // these are relationships
        bwdRefs.forEach(relationship => {
            // for each relationship, we may or may not want to look at it
            let comp = ecs.GetComponentByRef(relationship);
            if (IsRelevantRelationship(comp.type))
            {
                deltaIds.push(relationship);
                processed[relationship] = true;
                let total = deltaIds.length;
                FindRefsDownward(relationship, ecs, deltaIds, processed, typeIsIfcProduct);
                let added = deltaIds.length - total;
                console.log(comp.type[1], added);
            }
        });
    });
    */

    let guids = dedupe(ifcProducts.map((product) => ecs.GetComponentByRef(product).guid).filter(g => g));

    console.log("Modifed guids: ", guids);

    // up dir
    /*
    let newIds = [...relevantTopLevelIds];
    while(newIds.length > 0)
    {
        let nextIds = [];

        newIds.forEach((id) => {
            let bwdRefs = refTree.bwdRefs[id];

            if (!bwdRefs) return;

            bwdRefs.forEach((ref) => {
                if (!processed[ref])
                {
                    let comp = ecs.GetComponentByRef(ref);
                   // if (comp.type[1] !== "ifcrelaggregates")
                    {
                        // nextIds.push(ref);
                    }
                }
            });
        })


        nextIds.forEach((id) => {
            FindRefsDownward(id, ecs, deltaIds, processed, typeIsIfcProduct);
        })

        newIds = nextIds;
    }
    */

    return dedupeNumbers(deltaIds);
}
