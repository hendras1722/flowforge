
const context = { foo: 'bar' };
const code = `
function getData(){
  return '232'
}

getData()
`;

async function run() {
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const fn = new AsyncFunction("context", "response", "console", "log", "alert", "code", `
        return eval(code);
    `);
    
    try {
        const result = await fn(context, {}, console, console.log, console.log, code);
        console.log('Result:', result);
    } catch (e) {
        console.error('Error:', e);
    }
}

run();
