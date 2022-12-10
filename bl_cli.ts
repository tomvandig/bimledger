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

if (command === ADD_COMMAND)
{
    if (args.length < 2)
    {
        console.error(`Expected filename, type "bl help" for info`);
        process.exit(0);
    }

    let file = args[1];
    console.log(`Adding file: "${file}" to ecs`);
    
    let ecs = ConvertIFCToECS(fs.readFileSync(file).toString(), ParseEXP());
    fs.writeFileSync(ECS_NAME, JSON.stringify(ecs, null, 4));

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