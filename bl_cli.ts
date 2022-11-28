import { ECS1, ECS2 } from "./example";
import * as spark from "spark-md5";

type Reference = number;
type ComponentType = string[];

function ComponentTypeToString(type: ComponentType)
{
    return type.join("::");
}

interface CreatedComponent
{
    ref: Reference;
    guid: string | null;
    type: ComponentType;
    data: any;
}

interface ComponentModification
{
    attributeName: string;
    newValue: any;
}

interface ModifiedComponent
{
    ref: Reference;
    modifications: ComponentModification[];
}

interface ComponentsDelta
{
    added: CreatedComponent[];
    modified: ModifiedComponent[];
    removed: Reference[];
}

enum ComponentAttributeType
{
    NUMBER,
    STRING,
    ARRAY,
    LABEL,
    REF
}

interface ComponentAttributeValue
{
    type: ComponentAttributeType;
    child: ComponentAttributeValue | null;
}

interface ComponentAttribute
{
    name: string;
    value: ComponentAttributeValue;
}

interface ComponentSchema
{
    attributes: ComponentAttribute[];
}

interface ComponentDefinition
{
    id: ComponentType;
    parent: null | ComponentType;
    ownership: string;
    schema: ComponentSchema;
}

interface ExpiredComponent
{
    id: ComponentType;
}

interface DefinitionsDelta
{
    created: ComponentDefinition[];
    expired: ExpiredComponent[];
}

interface TransactionDelta
{
    components: ComponentsDelta;
    definitions: DefinitionsDelta;
}

interface Transaction
{
    date: string;
    hash: string;
    context: string;
    author: string;
    delta: TransactionDelta;
}

interface Ledger 
{
    transactions: Transaction[];
}

interface Component
{
    ref: Reference;
    hash: string;
    guid: null | string;
    type: ComponentType;
    data: any;   
}

interface ECS
{
    definitions: ComponentDefinition[];
    components: Component[];
}


/////////////////////////////////////////////////////

function GetMaxRef(ecs: ECS)
{
    let maxRef: Reference = 0;
    ecs.components.forEach(comp => {
        maxRef = Math.max(maxRef, comp.ref);
    });
    return maxRef;
}

function BuildRefMap(ecs: ECS)
{
    let map = {};
    ecs.components.forEach(comp => {
        map[comp.ref] = comp;
    });
    return map;
}

function BuildGuidMap(ecs: ECS)
{
    let map = {};
    ecs.components.forEach(comp => {
        if (comp.guid)
        {
            map[comp.guid] = comp.ref;
        }
    });
    return map;
}

function MakeCreatedComponent(comp: Component, ref: Reference)
{
    let ccomp: CreatedComponent = {
        ref,
        guid: comp.guid,
        type: comp.type,
        data: comp.data
    }

    return ccomp;
}

function attributeValueEqual(left: any, right: any, attrValue: ComponentAttributeValue)
{
    if (attrValue.type === ComponentAttributeType.ARRAY)
    {
        // good luck
        return false;
    }
    else
    {
        return left === right; // let's pretend we don't care about the details here
    }
}

function attributeEqual(left: any, right: any, attr: ComponentAttribute)
{
    if (left[attr.name] && right[attr.name])
    {
        return attributeValueEqual(left[attr.name], right[attr.name], attr.value);
    }
    else
    {
        // left or right does not match the schema!
        throw new Error(`Schema mismatch for attribute ${attr.name}`);
    }
}

function ApplyComponentModification(comp: Component, mod: ComponentModification)
{
    comp.data[mod.attributeName] = mod.newValue;
}

function BuildModifications(left: Component, right: Component, schema: ComponentSchema)
{
    let modifications: ComponentModification[] = [];
    schema.attributes.forEach((attr) => {
        if (!attributeEqual(left.data, right.data, attr))
        {
            modifications.push({ attributeName: attr.name, newValue: right.data[attr.name] } as ComponentModification)
        }
    });  
    return modifications;
}

function MakeModifiedComponent(left: Component, right: Component, schemaMap: any)
{
    if (left.hash === right.hash)
    {
        return false;
    }

    let componentDefinition = schemaMap[ComponentTypeToString(left.type)] as ComponentDefinition;

    if (!componentDefinition)
    {
        throw new Error(`Component type without definition ${ComponentTypeToString(left.type)}`);
    }

    let ccomp: ModifiedComponent = {
        ref: left.ref, // left is source of truth
        modifications: BuildModifications(left, right, componentDefinition.schema)
    }

    return ccomp;
}

function BuildSchemaMap(ecs: ECS)
{
    let defs = {};
    
    ecs.definitions.forEach((def) => {
        defs[ComponentTypeToString(def.id)] = def;
    })

    return defs;
}

function MergeSchemaMap(left: any, right: any, delta: DefinitionsDelta)
{
    // TODO: look for inconsistencies
    let merge = {};
    Object.keys(left).forEach((key) => {
        let l = left[key] as ComponentDefinition;
        let r = right[key] as ComponentDefinition;

        merge[key] = l; 

        if (!r)
        {
            // removed
            delta.expired.push({ id: l.id } as ExpiredComponent)
        }
    });
    Object.keys(right).forEach((key) => {
        let l = left[key] as ComponentDefinition;
        let r = right[key] as ComponentDefinition;
        
        merge[key] = l;
        
        if (!l)
        {
            // added
            delta.created.push(r);
        }
    });
    return merge;
}

function DiffECS(left: ECS, right: ECS): Transaction
{
    let nextRef = GetMaxRef(left) + 1;

    let refMapLeft = BuildRefMap(left);
    let refMapRight = BuildRefMap(right);
    let guidsLeft = BuildGuidMap(left);
    let guidsRight = BuildGuidMap(right);

    let schemaMapLeft = BuildSchemaMap(left);
    let schemaMapRight = BuildSchemaMap(right);

    let definitionsDelta: DefinitionsDelta = {
        created: [],
        expired: []
    };
    let schemaMap = MergeSchemaMap(schemaMapLeft, schemaMapRight, definitionsDelta);

    let matchingGuids: string[] = [];
    let addedGuids: string[] = [];
    let removedGuids: string[] = [];

    // check left for status quo
    Object.keys(guidsLeft).forEach((guid) => {
        if (guidsRight[guid])
        {
            // match!
            matchingGuids.push(guid);
        }
        else
        {
            // no match, removed!
            removedGuids.push(guid);
        }
    });

    // check right for added
    Object.keys(guidsRight).forEach((guid) => {
        if (guidsLeft[guid])
        {
            // match, but already processed!
        }
        else
        {
            // no match, added!
            addedGuids.push(guid);
        }
    });

    console.log(`matches: ${matchingGuids}`);
    console.log(`added: ${addedGuids}`);
    console.log(`removed: ${removedGuids}`);

    let allModifiedComponents = matchingGuids.map((guid) => MakeModifiedComponent(refMapLeft[guidsLeft[guid]], refMapRight[guidsRight[guid]], schemaMap));

    let componentsDelta: ComponentsDelta = {
        added: addedGuids.map((guid) => MakeCreatedComponent(refMapRight[guidsRight[guid]], nextRef++)),
        modified: allModifiedComponents.filter(m => m) as ModifiedComponent[],
        removed: removedGuids.map((guid) => guidsLeft[guid])
    }

    let delta: TransactionDelta = {
        components: componentsDelta,
        definitions: definitionsDelta
    }

    let transaction: Transaction = {
        date: "",
        hash: "",
        context: "",
        author: "bob@bob.com",
        delta, 
    };

    return transaction;
}

function Rehash(comp: Component)
{
    // TODO: this is so slow might as well do it in python
    comp.hash = spark.hash(JSON.stringify([comp.guid, comp.type, comp.data]));
}

function BuildComponent(ccomp: CreatedComponent)
{
    let comp: Component = {
        ref: ccomp.ref,
        hash: "", // TODO
        guid: ccomp.guid,
        type: ccomp.type,
        data: ccomp.data
    }

    return comp;
}

function ApplyTransaction(ecs: ECS, transaction: Transaction)
{
    transaction.delta.definitions.created.forEach((definition) => {
        ecs.definitions.push(definition);
    });

    // TODO: component expiration!

    // note that refmap is created before added components
    let refMap = BuildRefMap(ecs);

    transaction.delta.components.added.forEach((addedComponent) => {
        ecs.components.push(BuildComponent(addedComponent));
    });
    transaction.delta.components.modified.forEach((modifiedComponent) => {
        let originalComponent = refMap[modifiedComponent.ref];
        if (!originalComponent)
        {
            throw new Error(`Unknown modified component ref ${modifiedComponent.ref}`);
        }

        modifiedComponent.modifications.forEach((mod) => {
            ApplyComponentModification(originalComponent, mod);
        })
    });
    transaction.delta.components.removed.forEach((removedRef) => {
        let originalComponent = refMap[removedRef];
        if (!originalComponent)
        {
            throw new Error(`Unknown removed component ref ${removedRef}`);
        }

        ecs.components = ecs.components.filter(e => e.ref !== removedRef);
    });
}

function BuildECS(ledger: Ledger)
{
    let ecs: ECS = {
        definitions: [],
        components: []
    }

    ledger.transactions.forEach((transaction) => {
        ApplyTransaction(ecs, transaction);
    });

    ecs.components.forEach((comp) => Rehash(comp));

    return ecs;
}

let e1 = ECS1 as ECS;
let e2 = ECS2 as ECS;

let ledger: Ledger = {
    transactions: []
}

ledger.transactions.push(DiffECS({ components: [], definitions: [] }, e1));
let ecs1 = BuildECS(ledger)
ledger.transactions.push(DiffECS(ecs1, e2));

console.log(JSON.stringify(ledger.transactions, null, 4));

let ecs = BuildECS(ledger);

console.log(JSON.stringify(ecs, null, 4));

