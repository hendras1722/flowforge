
async function run() {
    const a = 1;
    const code = "await Promise.resolve(a + 1)";
    const result = await eval(`(async () => { return ${code} })()`);
    console.log('Result:', result);
}
run();
