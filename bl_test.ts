
import { expect } from 'chai';
import { BuildECS, DiffECS, ECS, Ledger, RehashECS } from './bl_cli';
import { describe, it } from "./crappucino";
import { GetExampleDefinition, GetExampleObject } from './example';

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {

        let def = GetExampleDefinition();

        let ECS1 = {
            definitions: [def],
            components: [
                GetExampleObject(41, "1", def, { coordinates: [28, 30, 1] }),
                GetExampleObject(42, "2", def, { coordinates: [28, 30, 2] }),
                GetExampleObject(43, "3", def, { coordinates: [28, 30, 3] }),
                GetExampleObject(44, null, def, { coordinates: [1, 1, 1] }),
                GetExampleObject(45, null, def, { coordinates: [1, 1, 2] })
            ]
        };
        
        let ECS2 = {
            definitions: [def],
            components: [
                GetExampleObject(41, "1", def, { coordinates: [28, 30, 4] }),
                GetExampleObject(42, "2", def, { coordinates: [28, 30, 5] }),
                GetExampleObject(44, "4", def, { coordinates: [28, 30, 6] }),
                GetExampleObject(45, null, def, { coordinates: [1, 1, 1] }),
                GetExampleObject(46, null, def, { coordinates: [1, 2, 3] })
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
        
        console.log(JSON.stringify(ledger.transactions, null, 4));
        
        let ecs = BuildECS(ledger);
        
        console.log(JSON.stringify(ecs, null, 4));

        expect(ecs.GetComponentByGuid("1")).to.not.be.null;
        
    });
  });
});