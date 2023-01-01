import { BuildReferenceTree, ECS, GetRefsFromComponent, Transaction } from "./bl_core";

function FindRefsDownward(id: number, ecs: ECS, deltaIds: number[], processed: {})
{
    let comp = ecs.GetComponentByRef(id);

    if (!comp) return;

    let refs = GetRefsFromComponent(comp);
    
    refs.forEach((ref) => {
        if (!processed[ref])
        {
            deltaIds.push(ref);
            processed[ref] = true;
            FindRefsDownward(ref, ecs, deltaIds, processed);
        }
    })
}

function GetUpwardsRefs()
{

}

export function ExportTransactionAsDeltaIds(transaction: Transaction, ecs: ECS)
{
    // TODO: use guids of ifcproduct here, won't work otherwise unless we trim the transaction further


    let deltaIds: number[] = [];
    let processed = {};

    // gather relevant ids from transaction
    let relevantTopLevelIds: number[] = [];


    let refTree = BuildReferenceTree(ecs);

    transaction.delta.components.added.forEach((comp) => {
        relevantTopLevelIds.push(comp.ref);
        deltaIds.push(comp.ref);
        processed[comp.ref] = true;
    });

    transaction.delta.components.modified.forEach((comp) => {
        relevantTopLevelIds.push(comp.ref);
        deltaIds.push(comp.ref);
        processed[comp.ref] = true;
    });

    relevantTopLevelIds.forEach((id) => {
        //FindRefsDownward(id, ecs, deltaIds, processed);
    });

    // up dir
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
            FindRefsDownward(id, ecs, deltaIds, processed);
        })

        newIds = nextIds;
    }


    return deltaIds;
}
