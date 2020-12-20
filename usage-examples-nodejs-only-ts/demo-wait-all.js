'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
import {WaitAll} from 'task-serializer';
const demo_lib_js_1 = require("./demo-lib.js");
async function consumer_waitAll(ts) {
    try {
        let r = await ts.waitAll();
        console.log(`ts.waitAll() returned`);
        console.log(JSON.stringify(r, null, 2));
    }
    catch (e) {
        console.log(`ts.waitAll() caught ${e.message}`);
    }
}
async function consumer_waitAllSettled(ts) {
    let r = await ts.waitAllSettled();
    console.log(`ts.waitAllSettled() returned`);
    console.log(JSON.stringify(r, null, 2));
    console.log('consumer finished');
}
async function main() {
    let waitAll = new uif_wait_all_js_1.WaitAll({ concurrentTaskLimit: 2 });
    await Promise.all([
        consumer_waitAll(waitAll),
        demo_lib_js_1.producer(waitAll),
    ]);
    waitAll = new uif_wait_all_js_1.WaitAll({ concurrentTaskLimit: 2 });
    await Promise.all([
        consumer_waitAllSettled(waitAll),
        demo_lib_js_1.producer(waitAll),
    ]);
}
main()
    .then(() => { console.log('success'); process.exitCode = 0; })
    .catch((e) => { console.log('failure ' + e.message); process.exitCode = 1; });
demo_lib_js_1.exitOnBeforeExit(2);
//# sourceMappingURL=demo-wait-all.js.map