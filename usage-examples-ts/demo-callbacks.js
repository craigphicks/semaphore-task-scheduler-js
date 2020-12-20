'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
import {Callbacks} from 'task-serializer';
const {producer}=require('./demo-lib.js');
async function consumer(ts) {
    await new Promise((resolve) => {
        ts.onTaskResolved((resolvedValue) => {
            console.log(`onTaskResolved ${resolvedValue}`);
        });
        ts.onTaskRejected((rejectedValue) => {
            console.log(`onTaskRejected ${rejectedValue}`);
        });
        ts.onEmpty(() => {
            console.log(`onEmpty`);
            resolve();
        });
    });
    console.log('consumer finished');
}
async function main() {
    let ts = new uif_callbacks_js_1.Callbacks({ concurrentTaskLimit: 2 });
    await Promise.all([
        consumer(ts),
        demo_lib_js_1.producer(ts)
    ]);
}
//# sourceMappingURL=demo-callbacks.js.map