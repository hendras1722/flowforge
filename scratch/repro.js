
const context = { lastResponse: { data: { foo: 'bar' } } };
const scriptLogs = [];
const logFunc = (msg) => scriptLogs.push(msg);
const alertFunc = (msg) => scriptLogs.push({ type: 'alert', message: msg });
const scriptConsole = { log: logFunc };

const code = `
function getData(){
  return 'hello'
}

getData()
`;

const fn = new Function("context", "response", "console", "log", "alert", `
    try {
        ${code};
        return { success: true };
    } catch (e) {
        throw e;
    }
`);

const result = fn(context, context.lastResponse.data, scriptConsole, logFunc, alertFunc);
console.log('Result:', result);
console.log('Logs:', scriptLogs);
