
const context = { lastResponse: { data: { foo: 'bar' } } };
const scriptLogs = [];
const logFunc = (msg) => {
    const s = typeof msg === "object" ? JSON.stringify(msg) : String(msg);
    scriptLogs.push({ type: "log", message: s });
};
const alertFunc = (msg) => {
    const s = String(msg);
    scriptLogs.push({ type: "alert", message: s });
};
const scriptConsole = { log: logFunc };

const code = `
function getData(){
  return 'hello'
}

return getData()
`;

const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
const fn = new AsyncFunction("context", "response", "console", "log", "alert", `
    "use strict";
    ${code}
`);

(async () => {
    const result = await fn(context, context.lastResponse.data, scriptConsole, logFunc, alertFunc);
    
    let finalResult = { success: true, result, output: scriptLogs };
    if (result !== undefined) {
        const s = typeof result === "object" ? JSON.stringify(result) : String(result);
        scriptLogs.push({ type: "log", message: `Result: \${s}` });
    }

    console.log('Final Result:', JSON.stringify(finalResult, null, 2));
})();
