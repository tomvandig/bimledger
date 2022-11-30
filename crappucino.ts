
// mocha is being difficult and it doesn't do much
let path = [];

export function describe(name: string, fn: any)
{
    path.push(name);
    fn();
    path.pop();
}

export function it(name: string, fn: any)
{
    try
    {
        fn();
    } catch(e)
    {
        console.log(` --- [FAIL] --- ${path.join("::")}::${name}`);
        console.log(e);
        return;
    }

    console.log(` [OK] ${path.join("::")}::${name}`);
}