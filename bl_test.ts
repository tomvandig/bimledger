
import { expect } from 'chai';
import { BuildECS, Component, ComponentAttributeInstance, DiffECS, ECS, Ledger, RehashECS, SetVerbose, VisitAttributes } from './bl_core';
import { describe, it } from "./crappucino";
import ExportToIfc from './ecs2ifc';
import { GetExampleObject, GetExamplePropDefinition, GetExamplePropSetDefinition, MakeArray, MakeAttr, MakeLabel, MakeNumber, MakeRef, MakeSelect, MakeString } from './example';
import { findSubClasses, ParseEXP } from './exp2ecs';
import ConvertIFCToECS from './ifc2ecs';
import { ifcdata } from './ifcdata';

describe('Integration Tests', function () {
    describe('Diff two ecs files', function () {
        it('Constructed ECS should reflect changes of both files', function () {

            let propDef = GetExamplePropDefinition();

            let ECS1 = {
                definitions: [propDef],
                components: [// [ MakeAttr("name", MakeString("myprop1")) ]
                    GetExampleObject(41, "1", propDef, [ MakeAttr("name", MakeString("myprop1"))] ),
                    GetExampleObject(42, "2", propDef, [ MakeAttr("name", MakeString("myprop2"))] ),
                    GetExampleObject(43, "3", propDef, [ MakeAttr("name", MakeString("myprop3"))] ),
                    GetExampleObject(44, null, propDef, [ MakeAttr("name", MakeString("width"))] ),
                    GetExampleObject(45, null, propDef, [ MakeAttr("name", MakeString("height"))] )
                ]
            };
            
            let ECS2 = {
                definitions: [propDef],
                components: [
                    GetExampleObject(41, "1", propDef, [ MakeAttr("name", MakeString("myprop4"))] ),
                    GetExampleObject(42, "2", propDef, [ MakeAttr("name", MakeString("myprop5"))] ),
                    GetExampleObject(44, "4", propDef, [ MakeAttr("name", MakeString("myprop6"))] ),
                    GetExampleObject(45, null, propDef, [ MakeAttr("name", MakeString("width"))] ),
                    GetExampleObject(46, null, propDef, [ MakeAttr("name", MakeString("length"))])
                ]
            };

            let e1 = RehashECS(new ECS(ECS1.definitions, ECS1.components));
            let e2 = RehashECS(new ECS(ECS2.definitions, ECS2.components));
            
            let ledger: Ledger = {
                transactions: []
            }
            
            ledger.transactions.push(DiffECS(new ECS([], []), e1));
            let ecs1 = BuildECS(ledger)
            ledger.transactions.push(DiffECS(ecs1, e2));

            let ecs = BuildECS(ledger);

            expect(ecs.GetComponentByGuid("1")).to.not.be.undefined;
            expect(ecs.GetComponentByGuid("2")).to.not.be.undefined;
            expect(ecs.GetComponentByGuid("3")).to.be.undefined;
            expect(ecs.GetComponentByGuid("4")).to.not.be.undefined;

            expect(ecs.GetComponentByRef(4)).to.not.be.undefined;
            expect(ecs.GetComponentByRef(7)).to.not.be.undefined;
        });
    });
});

describe('Unit Tests', function () {
    describe('Reference values', function () {
        it('Reference values should be resolved properly if values change', function () {

            let propDef = GetExamplePropDefinition();
            let propSetDef = GetExamplePropSetDefinition();

            let ECS1 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(1, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(2, null, propDef, [ MakeAttr("name", MakeString("myprop2")) ]),
                    GetExampleObject(3, "1", propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(1), MakeRef(2)]))] )
                ]
            );

            let ECS2 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(4, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(5, null, propDef, [ MakeAttr("name", MakeString("myprop4")) ]),
                    GetExampleObject(2, "1", propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(4), MakeRef(5)]))] )
                ]
            );
            
            SetVerbose(true);
            let initialTransaction = DiffECS(ECS1, ECS2);

            console.log(JSON.stringify(initialTransaction, null, 4));
            
        });
    });
});

describe('Unit Tests', function () {
    describe('Reference values', function () {
        it('Reference values should be updated inside component data', function () {

            let propDef = GetExamplePropDefinition();
            let propSetDef = GetExamplePropSetDefinition();

            let ECS2 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(4, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(5, null, propDef, [ MakeAttr("name", MakeString("myprop4")) ]),
                    GetExampleObject(2, "1", propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(4), MakeRef(5)]))] )
                ]
            );
            
            SetVerbose(true);
            let initialTransaction = DiffECS(new ECS([], []), ECS2);

            let set = initialTransaction.delta.components.added.filter(c => c.guid === "1")[0];
            expect(set.data[0].val.val[0].val).to.equal(2);
            expect(set.data[0].val.val[1].val).to.equal(3);
            
        });
    });
});

describe('Unit Tests', function () {
    describe('Hash collisions', function () {
        it('Hash collisions are cleared up when ECS is constructed', function () {

            let propDef = GetExamplePropDefinition();
            let propSetDef = GetExamplePropSetDefinition();

            let ECS2 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(1, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(2, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(3, "1", propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(1), MakeRef(2)]))] )
                ]
            );
            
            expect(ECS2.components.length).to.equal(2);
            let obj = ECS2.GetComponentByRef(3).data[0].val.val;
            expect(obj[0].val).to.equal(1);
            expect(obj[1].val).to.equal(1);
        });
    });
});

describe('Unit Tests', function () {
    describe('EXP parsing', function () {
        it('EXP should parse', function () {
            ParseEXP();
        });
    });
});

describe('Unit Tests', function () {
    describe('IFC parsing', function () {
        it('IFC should parse', function () {
            let ecs = ConvertIFCToECS(ifcdata, ParseEXP());
            expect(ecs.definitions.length).to.equal(653);
            expect(ecs.components.length).to.equal(579);
        });
    });
});

describe('Unit Tests', function () {
    describe('Visiting', function () {
        it('Visiting should visit everything', function () {

            let component: Component = {
                ref:0,
                hash: "",
                guid: null,
                type: [],
                data: [ 
                    MakeAttr("name", 
                    MakeArray([
                        MakeString("myprop1"),
                        MakeNumber(2.3),
                        MakeRef(1),
                        MakeLabel("type", MakeRef(2)),
                        MakeSelect(MakeRef(2)),
                    ]))
                ]
            };

            let attrs: ComponentAttributeInstance[] = [];
            VisitAttributes(component, (attr: ComponentAttributeInstance) => {
                console.log(attr.type);
                attrs.push(attr);
            });

            expect(attrs.length).to.equal(8);
        });
    });
});

describe('Unit Tests', function () {
    describe('Relationship objects', function () {
        it('Relationships should be properly deduplicated', function () {

            let propDef = GetExamplePropDefinition();
            let propSetDef = GetExamplePropSetDefinition();

            let ECS1 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(1, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(2, null, propDef, [ MakeAttr("name", MakeString("myprop2")) ]),
                    GetExampleObject(3, null, propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(1), MakeRef(2)]))] )
                ]
            );

            let ECS2 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(4, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(5, null, propDef, [ MakeAttr("name", MakeString("myprop2")) ]),
                    GetExampleObject(2, null, propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(4), MakeRef(5)]))] )
                ]
            );
            
            SetVerbose(true);
            let initialTransaction = DiffECS(ECS1, ECS2);

            console.log(JSON.stringify(initialTransaction, null, 4));
            
        });
    });
});

describe('Unit Tests', function () {
    describe('Export to ifc', function () {
        it('Check export to ifc', function () {

            let propDef = GetExamplePropDefinition();
            let propSetDef = GetExamplePropSetDefinition();

            let ECS1 = new ECS(
                [propDef, propSetDef],
                [
                    GetExampleObject(1, null, propDef, [ MakeAttr("name", MakeString("myprop1")) ]),
                    GetExampleObject(2, null, propDef, [ MakeAttr("name", MakeString("myprop2")) ]),
                    GetExampleObject(3, null, propSetDef, [ MakeAttr("properties", MakeArray([MakeRef(1), MakeRef(2)]))] )
                ]
            );

            let stepString = ExportToIfc(ECS1, null);

            console.log(stepString);
        });
    });
});