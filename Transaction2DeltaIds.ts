import { ECS, GetRefsFromComponent, Transaction } from "./bl_core";

function FindRefsDownward(id: number, ecs: ECS, deltaIds: number[], processed: {})
{
    let refs = GetRefsFromComponent(ecs.GetComponentByRef(id));
    
    refs.forEach((ref) => {
        if (!processed[ref])
        {
            deltaIds.push(ref);
            processed[ref] = true;
            FindRefsDownward(ref, ecs, deltaIds, processed);
        }
    })
}

export function ExportTransactionAsDeltaIds(transaction: Transaction, ecs: ECS)
{
    let deltaIds: number[] = [];
    let processed = {};

    // gather relevant guids from transaction

    let relevantTopLevelIds: number[] = [];

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
        FindRefsDownward(id, ecs, deltaIds, processed);
    });


    return deltaIds;
}
