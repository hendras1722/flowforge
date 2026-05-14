
const context = { foo: 'bar' };
const code = `
function getData(){
  return '232'
}

getData()
`;

async function run() {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    // We wrap it in a way that eval executes the code and returns the result of the last expression
    const fn = new AsyncFunction("context", "code", `
        return eval(code);
    `);
    
    try {
        const result = await fn(context, code);
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
