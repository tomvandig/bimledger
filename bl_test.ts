
import { expect } from 'chai';
import { BuildECS, DiffECS, ECS, Ledger, RehashECS, SetVerbose } from './bl_cli';
import { describe, it } from "./crappucino";
import { GetExampleObject, GetExamplePropDefinition, GetExamplePropSetDefinition } from './example';

describe('Integration Tests', function () {
  describe('Diff two ecs files', function () {
    it('Constructed ECS should reflect changes of both files', function () {

        let propDef = GetExamplePropDefinition();

        let ECS1 = {
            definitions: [propDef],
            components: [
                GetExampleObject(41, "1", propDef, { name: "myprop1" }),
                GetExampleObject(42, "2", propDef, { name: "myprop2" }),
                GetExampleObject(43, "3", propDef, { name: "myprop3" }),
                GetExampleObject(44, null, propDef, { name: "width" }),
                GetExampleObject(45, null, propDef, { name: "height" })
            ]
        };
        
        let ECS2 = {
            definitions: [propDef],
            components: [
                GetExampleObject(41, "1", propDef, { name: "myprop4" }),
                GetExampleObject(42, "2", propDef, { name: "myprop5" }),
                GetExampleObject(44, "4", propDef, { name: "myprop6" }),
                GetExampleObject(45, null, propDef, { name: "width" }),
                GetExampleObject(46, null, propDef, { name: "length" })
            ]
        };

        let e1 = RehashECS(new ECS(ECS1.definitions, ECS1.components));
        let e2 = RehashECS(new ECS(ECS2.definitions, ECS2.components));
        
        let ledger: Ledger = {
            transactions: []
        }
        

        SetVerbose(false);
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