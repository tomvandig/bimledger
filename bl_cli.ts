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

export interface Ledger 
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

export class ECS
{
    definitions: ComponentDefinition[];
    components: Component[];

    constructor(defs: ComponentDefinition[], comps: Component[])
    {
        this.definitions = defs;
        this.components = comps;
    }


    GetComponentByRef(ref: Reference)
    {
        return this.components.filter(c => c.ref === ref)[0];
    }
    
    GetComponentByGuid(guid: string)
    {
        return this.components.filter(c => c.guid === guid)[0];
    }
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

function BuildHashMap(ecs: ECS)
{
    let map = {};
    ecs.components.forEach(comp => {
        if (!comp.guid)
        {
            map[comp.hash] = comp.ref;
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
        if (left.length !== right.length)
        {
            return false;
        }

        for (let i = 0; i < left.length; i++)
        {
            if (!attributeValueEqual(left[i], right[i], attrValue.child))
            {
                return false;
            }
        }

        return true;
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

export function DiffECS(left: ECS, right: ECS): Transaction
{
    let nextRef = GetMaxRef(left) + 1;

    let refMapLeft = BuildRefMap(left);
    let refMapRight = BuildRefMap(right);
    let guidsLeft = BuildGuidMap(left);
    let guidsRight = BuildGuidMap(right);
    let hashMapLeft = BuildHashMap(left);
    let hashMapRight = BuildHashMap(right);

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
    
    let matchingHashes: string[] = [];
    let addedHashes: string[] = [];
    let removedHashes: string[] = [];

    // check left for status quo
    Object.keys(hashMapLeft).forEach((hash) => {
        if (hashMapRight[hash])
        {
            // match!
            matchingHashes.push(hash);
        }
        else
        {
            // no match, removed!
            removedHashes.push(hash);
        }
    });

    // check right for added
    Object.keys(hashMapRight).forEach((hash) => {
        if (hashMapLeft[hash])
        {
            // match, but already processed!
        }
        else
        {
            // no match, added!
            addedHashes.push(hash);
        }
    });

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
    
    console.log(`hash matches: ${matchingHashes}`);
    console.log(`hash added: ${addedHashes}`);
    console.log(`hash removed: ${removedHashes}`);

    console.log(`guids matches: ${matchingGuids}`);
    console.log(`guids added: ${addedGuids}`);
    console.log(`guids removed: ${removedGuids}`);

    let allModifiedComponents = matchingGuids.map((guid) => MakeModifiedComponent(refMapLeft[guidsLeft[guid]], refMapRight[guidsRight[guid]], schemaMap));
    // filter out nulls
    allModifiedComponents = allModifiedComponents.filter(m => m) as ModifiedComponent[]
    
    let allAddedComponents = addedGuids.map((guid) => MakeCreatedComponent(refMapRight[guidsRight[guid]], nextRef++));
    allAddedComponents = [...allAddedComponents, ...addedHashes.map((hash) => MakeCreatedComponent(refMapRight[hashMapRight[hash]], nextRef++))];

    let allRemovedComponents = removedGuids.map((guid) => guidsLeft[guid]);
    allRemovedComponents = [...allRemovedComponents, ...removedHashes.map((hash) => hashMapLeft[hash])];

    let componentsDelta: ComponentsDelta = {
        added: allAddedComponents,
        modified: allModifiedComponents,
        removed: allRemovedComponents
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

export function RehashECS(ecs: ECS)
{
    ecs.components.forEach(Rehash);
    return ecs;
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

export function BuildECS(ledger: Ledger)
{
    let ecs = new ECS([], []);

    ledger.transactions.forEach((transaction) => {
        ApplyTransaction(ecs, transaction);
    });

    ecs.components.forEach((comp) => Rehash(comp));

    return ecs;
}
