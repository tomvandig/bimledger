import * as spark from "spark-md5";

type Reference = number;
type ComponentType = string[];

let verbose = false;

export function SetVerbose(v: boolean)
{
    verbose = v;
}

export function ComponentTypeToString(type: ComponentType)
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
    namedType: string;
    val: number | string | boolean | ComponentAttributeInstance | ComponentAttributeInstance[];
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
    SELECT,
    ARRAY,
    LABEL,
    BOOLEAN,
    BINARY,
    LOGICAL,
    REF
}

export interface ComponentAttributeValue
{
    type: ComponentAttributeType;
    optional: boolean;
    child: ComponentAttributeValue | null | ComponentAttributeValue[];
}

export interface ComponentAttribute
{
    name: string;
    value: ComponentAttributeValue;
}

export interface ComponentSchema
{
    attributes: ComponentAttribute[];
}

export interface ComponentDefinition
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

        this.cleanupHashes();
    }

    cleanupHashes()
    {
        let refmap = BuildRefMap(this);
        let equivalenceMap = BuildEquivalenceHashMap(this, refmap);

        if (Object.keys(equivalenceMap).length === 0)
        {
            // all hashes unique!
            return;
        }
        else
        {
            // update all components to point to the unique hashes
            this.components.forEach((comp) => {
                VisitAttributes(comp, (attr: ComponentAttributeInstance) => {
                    if (attr.type === ComponentAttributeType.REF)
                    {
                        if (attr.val)
                        {
                            let val = attr.val as number;
                            let replacementRef = equivalenceMap[val];

                            if (!replacementRef)
                            {
                                // this hash is unique!
                                return;
                            }
                            
                            attr.val = replacementRef;
                        }
                    }
                });
            });

            // remove components which have a duplicate hash
            for (let i = 0; i < this.components.length; i++)
            {
                let comp = this.components[i];
                if (equivalenceMap[comp.ref])
                {
                    this.components[i] = null;
                }
            }

            this.components = this.components.filter(c => c !== null);
        }
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
    let map: {[index: number]:Component} = {};
    ecs.components.forEach(comp => {
        map[comp.ref] = comp;
    });
    return map;
}

function BuildGuidMap(ecs: ECS)
{
    let map: {[index: string]:number} = {};
    ecs.components.forEach(comp => {
        if (comp.guid)
        {
            map[comp.guid] = comp.ref;
        }
    });
    return map;
}

function HashComponent(comp: Component, ecs: ECS, refMap: {[index: number]:Component})
{
    let hash = [comp.guid, ...comp.type];
    VisitAttributes(comp, (attr: ComponentAttributeInstance) => {
        let hasNestedObj = attr.type === ComponentAttributeType.ARRAY || 
                           attr.type === ComponentAttributeType.SELECT ||
                           attr.type === ComponentAttributeType.LABEL; 

        if (hasNestedObj) 
        {
            // hashing this makes no sense, we want to hash the children
            return;
        }
                           
        if (attr.type === ComponentAttributeType.REF)
        {
            if (attr.val && attr.val !== comp.ref)
            {
                let val = attr.val as number;
                let childComp = refMap[val];
                if (!childComp)
                {
                    throw new Error(`Unknown component reference ${val}`);
                }
                hash.push(HashComponent(childComp, ecs, refMap));
            }
        }
        else
        {
            hash.push(attr.val as any);
        }
    })

    return spark.hash(hash.join(","));
}

function BuildEquivalenceHashMap(ecs: ECS, refMap: {[index: number]:Component})
{
    let map = {};
    let hashEquivalenceMap = {};

    ecs.components.forEach(comp => {
        if (!comp.guid)
        {
            comp.hash = HashComponent(comp, ecs, refMap);

            if (comp.hash === null || comp.hash === '')
            {
                throw new Error(`Null hash for component ${comp}`);
            }

            if (map[comp.hash])
            {
                // duplicate hash! Assume duplicate hash means identical component following git behavior, TODO: switch from md5 to SHA-1
                hashEquivalenceMap[comp.ref] = map[comp.hash];
            }
            else
            {
                map[comp.hash] = comp.ref;
            }
        }
    });

    return hashEquivalenceMap;
}

function BuildHashMap(ecs: ECS, refMap: {[index: number]:Component})
{
    let map = {};

    ecs.components.forEach(comp => {
        if (!comp.guid)
        {
            comp.hash = HashComponent(comp, ecs, refMap);

            if (comp.hash === null)
            {
                throw new Error(`Null hash for component ${comp}`);
            }

            if (map[comp.hash])
            {
                // duplicate hashes should have been corrected when the ECS is built, this is a bug!
                throw new Error(`Duplicate hash while building hashmap, this is a bug!`);
            }
            else
            {
                map[comp.hash] = comp.ref;
            }
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
    // console.log(left, right);
    // if (attrValue.type !== ComponentAttributeType.SELECT)
    // {

    // if (attrValue.type !== left.type)
    // {
    //     throw new Error(`Type ${attrValue.type} does not match left type ${left.type}`)
    // }
    
    // if (attrValue.type !== right.type)
    // {
    //     throw new Error(`Type ${attrValue.type} does not match right type ${right.type}`)
    // }
    //     return attributeValueEqual(left, right, attrValue.child as ComponentAttributeValue);
    // }

    // no need to check select here
    if (left.type === ComponentAttributeType.ARRAY)
    {
        if (!(left.val && right.val))
        {
            return left.val === right.val;
        }

        // good luck
        if (left.val.length !== right.val.length)
        {
            return false;
        }

        for (let i = 0; i < left.val.length; i++)
        {
            if (!attributeValueEqual(left.val[i], right.val[i], null))
            {
                return false;
            }
        }

        return true;
    }
    else if (left.type === ComponentAttributeType.LABEL)
    {
        if (left.namedType !== right.namedType)
        {
            return false;
        }

        attributeValueEqual(left.val as ComponentAttributeInstance, right.val as ComponentAttributeInstance, null)
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
        console.log(left, right);
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
            let newValue = GetAttrByName(attr.name, right);
            if (newValue)
            {
                modifications.push({ attributeName: attr.name, newValue: newValue.val } as ComponentModification)
            }
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

    if (ccomp.modifications.length === 0)
    {
        return false;
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

function VisitAttribute(attr: ComponentAttributeInstance, fn: (ComponentAttributeInstance)=>void)
{
    if (attr.type === ComponentAttributeType.ARRAY)
    {
        fn(attr);
        if (attr.val)
        {
            let attributes = attr.val as ComponentAttributeInstance[];
            attributes.forEach((ncai) => VisitAttribute(ncai, fn));
        }
    }
    else if (attr.type === ComponentAttributeType.LABEL)
    {
        fn(attr);
        if (attr.val)
        {
            VisitAttribute(attr.val as ComponentAttributeInstance, fn);
        }
    }
    else if (attr.type === ComponentAttributeType.SELECT)
    {
        fn(attr);
        if (attr.val)
        {
            VisitAttribute(attr.val as ComponentAttributeInstance, fn);
        }
    }
    else
    {
        // non-nested type
        fn(attr);
    }
}

export function VisitAttributes(comp: Component, fn: (ComponentAttributeInstance)=>void)
{
    comp.data.forEach((ncai) => {
        VisitAttribute(ncai.val, fn);
    })
}

function GetRefsFromComponent(comp: Component)
{
    let refs: Reference[] = [];
    VisitAttributes(comp, (attr: ComponentAttributeInstance) => {
        if (attr.type === ComponentAttributeType.REF)
        {
            if (attr.val)
            {
                refs.push(attr.val as number);
            }
        }
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

function BuildHashDiff(left: ECS, right: ECS, refMapLeft: {[index: number]:Component}, refMapRight: {[index: number]:Component})
{
    let diff = new HashDifference();
    
    diff.hashToRefLeft = BuildHashMap(left, refMapLeft);
    console.log(`e`);
    diff.hashToRefRight = BuildHashMap(right, refMapRight);

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

function BuildLockedReferences(hashDiff: HashDifference, guidsDiff: GuidsDifference, refMapLeft: any, refMapRight: any)
{
    // based on hash & guid equality we can try to map existing references together between the two ecs trees. 
    // We call a mapping from right to left reference a "locked" reference, in the sense that the final reference has been decided
    let lockedReferences = BuildInitialLockedReferences(hashDiff, guidsDiff);

    // we will now try to rewrite the references in the RIGHT ecs to match the references in the LEFT ecs
    // for this, we have to start with a list of known reference matches, derive new information to produce new reference matches, and so on
    // the locked references will already tell us all the elements which are equal by-hash or by guid. This narrows down the search space for small edits.

    let newlyLockedReferences = [];
    guidsDiff.matchingGuids.forEach((guid) => {
        let refR = guidsDiff.guidToRefRight[guid];
        if (!refR)
        {
            throw new Error(`Unknown right ref for guid ${guid}`);
        }
        newlyLockedReferences.push(refR);
    });

    while(true)
    {
        let nextIteration = [];

        newlyLockedReferences.forEach((refR) => {
            let refL = lockedReferences[refR];

            let compL = refMapLeft[refL];
            let compR = refMapRight[refR];

            if (!compL || !compR)
            {
                console.log(refL, refR);
                console.log(compL, compR);
                throw new Error(`Comp mismtach!`);
            }

            let refsL = GetRefsFromComponent(compL);
            let refsR = GetRefsFromComponent(compR);

            if (refsL.length !== refsR.length)
            {
                // some set of refs got changed, there is a genuine modification between these two elements
                // we could try to assign these in some way, but its better to rely on hashing here
            }
            else
            {
                // TODO: found real life examples where types are mixed and references moved within the set, good to do more intelligent mapping
                // same amount of refs, lets try to match them together naively
                for (let i = 0; i < refsL.length; i++)
                {
                    let refL = refsL[i];
                    let refR = refsR[i];

                    let compL = refMapLeft[refL];
                    let compR = refMapRight[refR];

                    // to match these, they must have the same type!
                    if (ComponentTypeToString(compL.type) !== ComponentTypeToString(compR.type))
                    {
                        // differing types, no idea what to do, skip this
                        continue;
                    }
                    
                    if (lockedReferences[refR])
                    {
                        let lockedRef = lockedReferences[refR];
                        if (lockedRef === refL)
                        {
                            // ref is locked to the same ref as L, all is good
                        }
                        else
                        {
                            // ref is locked, but NOT to same ref as L, this is a modification of the component
                            // basically it means that this component references a different component now
                        }
                    }
                    else
                    {
                        // no locked reference yet for R, we greedily capture L as the locked reference and assume that's the right thing to do
                        // if it turns out we're wrong, we're gonna be modifying a bunch of components unnecessarily
                        lockedReferences[refR] = refL;
                        nextIteration.push(refR);
                    }
                }
            }
        });

        if (nextIteration.length === 0)
        {
            break;
        }

        newlyLockedReferences = nextIteration;
    }

    // for added guids, the story is simpler, we look if the tree has hashes we already know, those can be locked, others are forced to become new entities
    // in other words, there is nothing to do
    // for removed guids, there is also nothing to do

    return lockedReferences;
}

function UpdateComponentRefsToMatchLeft(comp: Component, newLeftRefForNewRightRef: any)
{
    VisitAttributes(comp, (attr: ComponentAttributeInstance) => {
        if (attr.type === ComponentAttributeType.REF)
        {
            if (attr.val)
            {
                let newRef = newLeftRefForNewRightRef[attr.val];

                if (!newRef)
                {
                    throw new Error(`Unknown new left ref for ${attr.val}`);
                }
                
                attr.val = newRef;
            }
        }
    });
}

export function DiffECS(left: ECS, right: ECS): Transaction
{
    let nextRef = GetMaxRef(left) + 1;

    let refMapLeft = BuildRefMap(left);
    let refMapRight = BuildRefMap(right);

    // let referenceTreeLeft = BuildReferenceTree(left);
    // let referenceTreeRight = BuildReferenceTree(right);

    let schemaMapLeft = BuildSchemaMap(left);
    let schemaMapRight = BuildSchemaMap(right);

    let definitionsDelta: DefinitionsDelta = {
        created: [],
        expired: []
    };

    let schemaMap = MergeSchemaMap(schemaMapLeft, schemaMapRight, definitionsDelta);

    let hashDiff = BuildHashDiff(left, right, refMapLeft, refMapRight);
    let guidsDiff = BuildGuidsDiff(left, right);
    console.log("d");
    
    if (true)
    {
        console.log(`hash matches: ${hashDiff.matchingHashes}`);
        console.log(`hash matches: ${left.components.length}`);
        console.log(`hash matches: ${right.components.length}`);
        console.log(`hash matches: ${hashDiff.matchingHashes.length}`);
        console.log(`hash added: ${hashDiff.addedHashes}`);
        console.log(`hash removed: ${hashDiff.removedHashes}`);

        console.log(`guids matches: ${guidsDiff.matchingGuids}`);
        console.log(`guids added: ${guidsDiff.addedGuids}`);
        console.log(`guids removed: ${guidsDiff.removedGuids}`);
    }

    let lockedReferences = BuildLockedReferences(hashDiff, guidsDiff, refMapLeft, refMapRight);

    let invertedLockedReferences = {};
    Object.keys(lockedReferences).forEach((refRight) => invertedLockedReferences[lockedReferences[refRight]] = refRight);

    let allRemovedComponents = [];
    let allModifiedComponents = [];
    let allAddedComponents = [];

    Object.keys(refMapLeft).forEach((refLeft) => {
        let refRight = invertedLockedReferences[refLeft];

        if (!refRight)
        {
            // this ref has been removed
            allRemovedComponents.push(parseInt(refLeft)); // ???
        }
    });

    // TODO: look at removed/added component pairs to figure out which references can be carried over from old to new components
    // since we have freedom to use any reference from removed components as we wish, we can simply grab an added component that is most similar
    // reference repair will pick up the changes
    // such a mapping can then be transformed to a component modification, which is probably what the user wants in the end
    let newLeftRefForNewRightRef = {};
    
    Object.keys(refMapRight).forEach((refRight) => {
        let refLeft = lockedReferences[refRight];

        if (refLeft)
        {
            newLeftRefForNewRightRef[refRight] = refLeft;
        }
        else
        {
            newLeftRefForNewRightRef[refRight] = nextRef++;
        }
    });

    Object.keys(refMapRight).forEach((refRight) => {
        let refLeft = lockedReferences[refRight];

        if (refLeft)
        {
            // this ref is a match!
            UpdateComponentRefsToMatchLeft(refMapRight[refRight], newLeftRefForNewRightRef);

            let modification = MakeModifiedComponent(refMapLeft[refLeft], refMapRight[refRight], schemaMap);
            if (modification) allModifiedComponents.push(modification);
        }
        else
        {
            // this ref is new!
            let newLeftRef = newLeftRefForNewRightRef[refRight];

            if (!newLeftRef)
            {
                // this is unknown
                throw new Error(`Missing mapping to left ref!`);
            }
            else
            {
                UpdateComponentRefsToMatchLeft(refMapRight[refRight], newLeftRefForNewRightRef);
                allAddedComponents.push(MakeCreatedComponent(refMapRight[refRight], newLeftRef));
            }
        }
    });
    
/*
    let allModifiedComponents = guidsDiff.matchingGuids.map((guid) => MakeModifiedComponent(refMapLeft[guidsDiff.guidToRefLeft[guid]], refMapRight[guidsDiff.guidToRefRight[guid]], schemaMap)) as ModifiedComponent[];
    // filter out nulls
    allModifiedComponents = allModifiedComponents.filter(m => m) as ModifiedComponent[];
    
    let allAddedComponents = guidsDiff.addedGuids.map((guid) => MakeCreatedComponent(refMapRight[guidsDiff.guidToRefRight[guid]], nextRef++));
    allAddedComponents = [...allAddedComponents, ...hashDiff.addedHashes.map((hash) => MakeCreatedComponent(refMapRight[hashDiff.hashToRefRight[hash]], nextRef++))];

    let allRemovedComponents = guidsDiff.removedGuids.map((guid) => guidsDiff.guidToRefLeft[guid]);
    allRemovedComponents = [...allRemovedComponents, ...hashDiff.removedHashes.map((hash) => hashDiff.hashToRefLeft[hash])];
    */

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
