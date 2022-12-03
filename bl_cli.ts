import * as spark from "spark-md5";

type Reference = number;
type ComponentType = string[];

let verbose = false;

export function SetVerbose(v: boolean)
{
    verbose = v;
}

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

export interface ComponentAttributeInstance
{
    type: ComponentAttributeType;
    val: any;
}

export interface NamedComponentAttributeInstance
{
    name: string;
    val: ComponentAttributeInstance;
}

export enum ComponentAttributeType
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

export interface Component
{
    ref: Reference;
    hash: string;
    guid: null | string;
    type: ComponentType;
    data: NamedComponentAttributeInstance[];   
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

function attributeValueEqual(left: ComponentAttributeInstance, right: ComponentAttributeInstance, attrValue: ComponentAttributeValue)
{
    if (attrValue.type !== left.type)
    {
        throw new Error(`Type ${attrValue.type} does not match left type ${left.type}`)
    }
    
    if (attrValue.type !== right.type)
    {
        throw new Error(`Type ${attrValue.type} does not match right type ${right.type}`)
    }

    if (attrValue.type === ComponentAttributeType.ARRAY)
    {
        // good luck
        if (left.val.length !== right.val.length)
        {
            return false;
        }

        for (let i = 0; i < left.val.length; i++)
        {
            if (!attributeValueEqual(left.val[i], right.val[i], attrValue.child))
            {
                return false;
            }
        }

        return true;
    }
    else
    {
        return left.val === right.val; // let's pretend we don't care about the details here
    }
}

function GetAttrByName(name: string, comp: Component)
{
    let attrs = comp.data.filter((ncai) => ncai.name === name); 
    if (attrs.length === 0) return false;
    return attrs[0];
}

function attributeEqual(left: Component, right: Component, attr: ComponentAttribute)
{
    let l = GetAttrByName(attr.name, left);
    let r = GetAttrByName(attr.name, right);

    if (l && r)
    {
        return attributeValueEqual(l.val, r.val, attr.value);
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
        if (!attributeEqual(left, right, attr))
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
            if (verbose) console.log(`Removed ${key}`);
            delta.expired.push({ id: l.id } as ExpiredComponent)
        }
        else
        {
            if (verbose) console.log(`Skipped ${key}`);
        }
    });
    Object.keys(right).forEach((key) => {
        let l = left[key] as ComponentDefinition;
        let r = right[key] as ComponentDefinition;
        
        merge[key] = l;
        
        if (!l)
        {
            // added
            if (verbose) console.log(`Added ${key}`);
            delta.created.push(r);
        }
        else
        {
            if (verbose) console.log(`Skipped ${key}`);
        }
    });
    return merge;
}

function GetRefs(attr: ComponentAttributeInstance, references: Reference[])
{
    if (attr.type === ComponentAttributeType.REF)
    {
        references.push(attr.val);
    }
    else if (attr.type === ComponentAttributeType.ARRAY)
    {
        attr.val.forEach((ncai) => GetRefs(ncai, references));
    }
    else
    {
        // other types arent refs ever
        return;
    }
}


function GetRefsFromComponent(comp: Component)
{
    let refs: Reference[] = [];
    comp.data.forEach((ncai) => {
        GetRefs(ncai.val, refs);
    })
    return refs;
}

function UpdateDepth(ref: Reference, bwdRefs: any, depthMap: any, depth: number)
{
    // update current component depth
    if (!depthMap[ref] || depthMap[ref] < depth)
    {
        // component receives a new depth
        depthMap[ref] = depth;

        // traverse up the tree increasing the depth
        let bwd = bwdRefs[ref];
        if (bwd)
        {
            bwd.forEach((ref) => {
                UpdateDepth(ref, bwdRefs, depthMap, depth + 1);
            });
        }
    }
    else
    {
        // component was already at greater depth, no need to update it or its referees
    }
}

class ReferenceTree {
    depthMap: any;
    fwdRefs: any;
    bwdRefs: any;
}   

function BuildReferenceTree(ecs: ECS)
{
    let tree = new ReferenceTree();

    tree.depthMap = {};
    tree.fwdRefs = {};
    tree.bwdRefs = {};

    // build back/for refs
    // TODO: check for loops here
    ecs.components.forEach((comp) => {
        let refs = GetRefsFromComponent(comp);
        tree.fwdRefs[comp.ref] = refs;

        refs.forEach((ref) => {
            if (!tree.bwdRefs[ref]) tree.bwdRefs[ref] = [];
            tree.bwdRefs[ref].push(comp.ref);
        });
    });

    // find all components of depth 0
    ecs.components.forEach((comp) => {
        let fwd = tree.fwdRefs[comp.ref];
        if (!fwd || fwd.length === 0)
        {
            // we know this component is at depth 0, we can derive the depth upwards from here
            UpdateDepth(comp.ref, tree.bwdRefs, tree.depthMap, 0);
        }
    });


    if (verbose)
    {
        console.log(`---dm`, tree.depthMap);
    }

    return tree;
}

class HashDifference {
    hashToRefLeft: any = {};
    hashToRefRight: any = {};
    matchingHashes: string[] = [];
    addedHashes: string[] = [];
    removedHashes: string[] = [];
}

class GuidsDifference {
    guidToRefLeft: any = {};
    guidToRefRight: any = {};
    matchingGuids: string[] = [];
    addedGuids: string[] = [];
    removedGuids: string[] = [];
}

function BuildHashDiff(left: ECS, right: ECS)
{
    let diff = new HashDifference();
    
    diff.hashToRefLeft = BuildHashMap(left);
    diff.hashToRefRight = BuildHashMap(right);

    // check left for status quo
    Object.keys(diff.hashToRefLeft).forEach((hash) => {
        if (diff.hashToRefRight[hash])
        {
            // match!
            diff.matchingHashes.push(hash);
        }
        else
        {
            // no match, removed!
            diff.removedHashes.push(hash);
        }
    });

    // check right for added
    Object.keys(diff.hashToRefRight).forEach((hash) => {
        if (diff.hashToRefLeft[hash])
        {
            // match, but already processed!
        }
        else
        {
            // no match, added!
            diff.addedHashes.push(hash);
        }
    });

    return diff;
}

function BuildGuidsDiff(left: ECS, right: ECS)
{
    let diff = new GuidsDifference();

    diff.guidToRefLeft = BuildGuidMap(left);
    diff.guidToRefRight = BuildGuidMap(right);
    

    // check left for status quo
    Object.keys(diff.guidToRefLeft).forEach((guid) => {
        if (diff.guidToRefRight[guid])
        {
            // match!
            diff.matchingGuids.push(guid);
        }
        else
        {
            // no match, removed!
            diff.removedGuids.push(guid);
        }
    });

    // check right for added
    Object.keys(diff.guidToRefRight).forEach((guid) => {
        if (diff.guidToRefLeft[guid])
        {
            // match, but already processed!
        }
        else
        {
            // no match, added!
            diff.addedGuids.push(guid);
        }
    });

    return diff;
}

function BuildInitialLockedReferences(hashDiff: HashDifference, guidsDiff: GuidsDifference)
{
    let lockedReferences = {};

    hashDiff.matchingHashes.forEach((matchingHash) => {
        let refLeft = hashDiff.hashToRefLeft[matchingHash];
        let refRight = hashDiff.hashToRefRight[matchingHash];

        lockedReferences[refRight] = refLeft;
    });
    
    guidsDiff.matchingGuids.forEach((matchingGuid) => {
        let refLeft = guidsDiff.guidToRefLeft[matchingGuid];
        let refRight = guidsDiff.guidToRefRight[matchingGuid];

        lockedReferences[refRight] = refLeft;
    });

    return lockedReferences;
}

function MakeTreeReferencesCompatible(hashDiff: HashDifference, guidsDiff: GuidsDifference, refMapLeft: any, refMapRight: any)
{
    // based on hash & guid equality we can try to map existing references together between the two ecs trees. 
    // We call a mapping from right to left reference a "locked" reference, in the sense that the final reference has been decided
    let lockedReferences = BuildInitialLockedReferences(hashDiff, guidsDiff);

    console.log(`-- locked`, lockedReferences);

    // we will now try to rewrite the references in the RIGHT ecs to match the references in the LEFT ecs
    // because we need to rewrite child-references before proceeding upwards in the tree, we consult the depth map
}

export function DiffECS(left: ECS, right: ECS): Transaction
{
    let nextRef = GetMaxRef(left) + 1;

    let refMapLeft = BuildRefMap(left);
    let refMapRight = BuildRefMap(right);

    let referenceTreeLeft = BuildReferenceTree(left);
    let referenceTreeRight = BuildReferenceTree(right);

    let schemaMapLeft = BuildSchemaMap(left);
    let schemaMapRight = BuildSchemaMap(right);

    let definitionsDelta: DefinitionsDelta = {
        created: [],
        expired: []
    };
    let schemaMap = MergeSchemaMap(schemaMapLeft, schemaMapRight, definitionsDelta);

    let hashDiff = BuildHashDiff(left, right);
    let guidsDiff = BuildGuidsDiff(left, right);
    
    if (verbose)
    {
        console.log(`hash matches: ${hashDiff.matchingHashes}`);
        console.log(`hash added: ${hashDiff.addedHashes}`);
        console.log(`hash removed: ${hashDiff.removedHashes}`);

        console.log(`guids matches: ${guidsDiff.matchingGuids}`);
        console.log(`guids added: ${guidsDiff.addedGuids}`);
        console.log(`guids removed: ${guidsDiff.removedGuids}`);
    }

    MakeTreeReferencesCompatible(hashDiff, guidsDiff, refMapLeft, refMapRight);

    let allModifiedComponents = guidsDiff.matchingGuids.map((guid) => MakeModifiedComponent(refMapLeft[guidsDiff.guidToRefLeft[guid]], refMapRight[guidsDiff.guidToRefRight[guid]], schemaMap)) as ModifiedComponent[];
    // filter out nulls
    allModifiedComponents = allModifiedComponents.filter(m => m) as ModifiedComponent[];
    
    let allAddedComponents = guidsDiff.addedGuids.map((guid) => MakeCreatedComponent(refMapRight[guidsDiff.guidToRefRight[guid]], nextRef++));
    allAddedComponents = [...allAddedComponents, ...hashDiff.addedHashes.map((hash) => MakeCreatedComponent(refMapRight[hashDiff.hashToRefRight[hash]], nextRef++))];

    let allRemovedComponents = guidsDiff.removedGuids.map((guid) => guidsDiff.guidToRefLeft[guid]);
    allRemovedComponents = [...allRemovedComponents, ...hashDiff.removedHashes.map((hash) => hashDiff.hashToRefLeft[hash])];

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
