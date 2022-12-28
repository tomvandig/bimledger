import { BuildECS, DiffECS, ECS, Ledger } from "./bl_core";
import { ParseEXP } from "./exp2ecs";
import ConvertIFCToECS from "./ifc2ecs";

let fs = require("fs");
let path = require("path");

let args = process.argv.slice(2, process.argv.length);

console.log(` - Invoked BL_CLI with args: [${args}]`);

let BL_DIR = ".bl";
let ECS_NAME = path.join(BL_DIR, "ecs.json");
let LEDGER_NAME = path.join(BL_DIR, "ledger.json");

function ensure_bl_dir()
{
    if (!fs.existsSync(BL_DIR))
    {
        fs.mkdirSync(BL_DIR);
    }
}

ensure_bl_dir();

let command = args[0];

let ADD_COMMAND = "add";
let HELP_COMMAND = "help";
let STATUS_COMMAND = "status";
let LAST_COMMAND = "last";
let RESET_COMMAND = "reset";

if (command === ADD_COMMAND)
{
    if (args.length < 2)
    {
        console.error(`Expected filename, type "bl help" for info`);
        process.exit(0);
    }

    let file = args[1];
    console.log(`Adding file: "${file}" to ecs`);
    
    console.log(`Reading current ECS`);
    let current_ecs = fs.existsSync(ECS_NAME) ? JSON.parse(fs.readFileSync(ECS_NAME).toString()) : { definitions: [], components: [] } as ECS;
    
    console.log(`Converting IFC to ECS`);
    let modified_ecs = ConvertIFCToECS(fs.readFileSync(file).toString(), ParseEXP());
    
    console.log(`Reading ledger`);
    let ledger = fs.existsSync(LEDGER_NAME) ? JSON.parse(fs.readFileSync(LEDGER_NAME).toString()) : { transactions: [] } as Ledger;

    console.log(`Creating ECS transaction from diff....`);
    let transaction = DiffECS(current_ecs, modified_ecs);

    console.log(`Updating ledger`);
    ledger.transactions.push(transaction);

    console.log(`Building new ECS`);
    let new_ecs = BuildECS(ledger);

    console.log(`Writing new ECS`);
    fs.writeFileSync(ECS_NAME, JSON.stringify(new_ecs));
    console.log(`Writing new ledger`);
    fs.writeFileSync(LEDGER_NAME, JSON.stringify(ledger));
}
else if (command === STATUS_COMMAND)
{
    let ledger = fs.existsSync(LEDGER_NAME) ? JSON.parse(fs.readFileSync(LEDGER_NAME).toString()) as Ledger : { transactions: [] } as Ledger;
    console.log(`Ledger has ${ledger.transactions.length} transactions: `);
    ledger.transactions.forEach((transaction) => {
        console.log(`Transaction`);
        console.log(` - with ${transaction.delta.definitions.created.length} created definitions`);
        console.log(` - with ${transaction.delta.definitions.expired.length} expired definitions`);
        console.log(` - with ${transaction.delta.components.added.length} added components`);
        console.log(` - with ${transaction.delta.components.modified.length} modified components`);
        console.log(` - with ${transaction.delta.components.removed.length} removed components`);


    })
}
else if (command === LAST_COMMAND)
{
    let ledger = fs.existsSync(LEDGER_NAME) ? JSON.parse(fs.readFileSync(LEDGER_NAME).toString()) as Ledger : { transactions: [] } as Ledger;
    console.log(`Ledger has ${ledger.transactions.length} transactions: `);
    console.log(`Last transaction:`);
    console.log(JSON.stringify(ledger.transactions[ledger.transactions.length - 1], null, 4));
}
else if (command === RESET_COMMAND)
{
    console.log(`Cleaning BL dir ${BL_DIR}`);
    fs.rmdirSync(BL_DIR, { recursive: true});
}
else if (command === HELP_COMMAND)
{
    console.log(`bl add <filename> -> adds file to current ecs, creating transaction in the ledger`);
    console.log(`bl status -> current status of the ledger`);
}
else
{
    console.error(`Unknown command ${command}, type help for help`);
}