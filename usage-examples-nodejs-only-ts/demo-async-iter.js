"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
import {AsyncIter}=require('task-serializer)
const demo_lib_1 = require("./demo-lib");
async function consumer(ai) {
    do {
        try {
            for await (const res of ai) {
                console.log('    ' + JSON.stringify(res));
            }
            break;
        }
        catch (e) {
            console.log('    ' + 'error: ' + e.message);
        }
    } while (true);
}
async function main() {
    let ai = new index_1.AsyncIter({ concurrentTaskLimit: 2 });
    await Promise.all([demo_lib_1.producer(ai), consumer(ai)]);
}
main()
    .then(() => { console.log('success'); process.exitCode = 0; })
    .catch((e) => { console.log('failure ' + e.message); process.exitCode = 1; });
demo_lib_1.exitOnBeforeExit(2);
//# sourceMappingURL=demo-async-iter.js.map