import { BuildECS, DiffECS, ECS, Ledger } from "./bl_core";
import { ParseEXP } from "./exp2ecs";
import ConvertIFCToECS from "./ifc2ecs";

console.log(`BL web`);

let ledger: Ledger = { transactions: [] } as Ledger;
let current_ecs: ECS = new ECS([], []);


document.addEventListener("DOMContentLoaded", function () {
    let outputLog = document.getElementById("outputlog");

    function log(txt: string)
    {
        outputLog.innerHTML += txt + "<br>";
    }

    document.getElementById("fileinput").onchange = function(evt) {
        var reader = new FileReader();

        console.log(`input change`);

        reader.onload = async function(evt) {
            if(evt.target.readyState != 2) return;
            if(evt.target.error) {
                alert('Error while reading file');
                return;
            }
            
            log(`Current ECS has ${current_ecs.definitions.length} definitions`);
            log(`Current ECS has ${current_ecs.components.length} components`);

            let filecontent = evt.target.result as string;

            let response = await (await fetch('IFC4.exp')).text();

            log(`Converting IFC file to ECS...`);
            let modified_ecs = ConvertIFCToECS(filecontent, ParseEXP(response));
            log(`Done`);

            log(`Added ECS has ${modified_ecs.definitions.length} definitions`);
            log(`Added ECS has ${modified_ecs.components.length} components`);
            
            log(`Creating transaction...`);
            let transaction = DiffECS(current_ecs, modified_ecs);
            log(`Done!`);

            log(`Transaction has ${transaction.delta.definitions.created.length} created definitions`);
            log(`Transaction has ${transaction.delta.components.added.length} added components`);
            log(`Transaction has ${transaction.delta.components.removed.length} removed components`);
            log(`Transaction has ${transaction.delta.components.modified.length} modified components`);

            log(`Current ECS has ${current_ecs.definitions.length} definitions`);
            log(`Current ECS has ${current_ecs.components.length} components`);
            
            ledger.transactions.push(transaction);
            
            log(`Current ledger has ${ledger.transactions.length} transactions`);

            current_ecs = BuildECS(ledger);
        };

        reader.readAsText(evt.target.files[0]);

    }
}, false);