import { BuildECS, DiffECS, ECS, Ledger } from "./bl_core";
import ExportToIfc from "./ecs2ifc";
import { ParseEXP } from "./exp2ecs";
import ConvertIFCToECS from "./ifc2ecs";
import { ExportTransactionAsDeltaIds } from "./Transaction2DeltaIds";

console.log(`BL web`);

let ledger: Ledger = { transactions: [] } as Ledger;
let current_ecs: ECS = new ECS([], []);

function DownloadString(str: string, name: string)
{
    const uri = window.URL.createObjectURL(new Blob([str], {
        type: 'text/plain'
    }));
    var link = document.createElement("a");
    // If you don't know the name or want to use
    // the webserver default set name = ''
    link.setAttribute('download', name);
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

document.addEventListener("DOMContentLoaded", function () {
    let outputLog = document.getElementById("outputlog");
    let schema_select = document.getElementById("select_schema");

    document.getElementById("button_dl_ecs").onclick  = () => {
        DownloadString(JSON.stringify(current_ecs, null, 4), "ecs.json");
    };

    document.getElementById("button_dl_ledger").onclick  = () => {
        DownloadString(JSON.stringify(ledger, null, 4), "ledger.json");
    };

    document.getElementById("button_dl_transaction").onclick  = () => {
        let lastTransaction = ledger.transactions[ledger.transactions.length - 1];
        DownloadString(JSON.stringify(lastTransaction, null, 4), "transaction.json");
    };
    
    document.getElementById("button_dl_ifc").onclick  = () => {
        let schema = schema_select.value;
        DownloadString(ExportToIfc(current_ecs, null, schema === "ifc2x3"), "export.ifc");
    };

    document.getElementById("button_dl_delta").onclick  = () => {
        let schema = schema_select.value;
        let lastTransaction = ledger.transactions[ledger.transactions.length - 1];
        let ids = ExportTransactionAsDeltaIds(lastTransaction, current_ecs)
        DownloadString(ExportToIfc(current_ecs, ids, schema === "ifc2x3"), "delta.ifc");
    };

    function log(txt: string)
    {
        outputLog.innerHTML += txt + "<br>";
    }

    log(`Choose a file below, and select the schema of the file`)
    log(`!!! NOTE: Mixing schemas will make everything explode !!!`)

    document.getElementById("fileinput").onchange = function(evt) {
        let schema = schema_select.value;

        var reader = new FileReader();

        console.log(`input change`);

        reader.onload = async function(evt) {
            if(evt.target.readyState != 2) return;
            if(evt.target.error) {
                alert('Error while reading file');
                return;
            }
            
            try{
                log(``);
                log(`Current ECS has ${current_ecs.definitions.length} definitions`);
                log(`Current ECS has ${current_ecs.components.length} components`);

                let filecontent = evt.target.result as string;

                let schemaFileName = schema === "ifc2x3" ? "ifc2x3.exp" : "IFC4.exp";

                log(`Using schema ${schemaFileName}`);

                let response = await (await fetch(schemaFileName)).text();

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
                
                ledger.transactions.push(transaction);
                
                log(`Current ledger has ${ledger.transactions.length} transactions`);

                current_ecs = BuildECS(ledger);

                log(`Current ECS has ${current_ecs.definitions.length} definitions`);
                log(`Current ECS has ${current_ecs.components.length} components`);
            } catch(e)
            {
                log(e);
                log(`Please check if you're using the right schema, otherwise, sorry :-)`);
                throw e;
            }

            window.scrollTo(0, document.body.scrollHeight);
        };

        reader.readAsText(evt.target.files[0]);

    }
}, false);