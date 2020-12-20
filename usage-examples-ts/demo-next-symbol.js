'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
import {NextSymbol} from 'task-serializer';
import {makepr,producer} from './demo-lib.js';
var somethingElse = demo_lib_js_1.makepr();
var iv = setInterval(() => { somethingElse.resolve("somethingElse"); }, 300);
async function consumer(ts) {
    let emptied = false;
    while (!emptied) {
        let next = await Promise.race([
            somethingElse.promise,
            ts.nextSymbol(),
        ]);
        switch (next) {
            case "somethingElse":
                console.log(next);
                somethingElse = demo_lib_js_1.makepr(); // reset
                break;
            case ts.symbolTaskResolved(): {
                console.log();
                let res = ts.getTaskResolvedValue();
                console.log("symbolTaskResolved, result=" + res);
                break;
            }
            case ts.symbolTaskRejected(): {
                let e = ts.getTaskRejectedValue();
                console.log("symbolTaskRejected, message=" + e.message);
                break;
            }
            case ts.symbolAllRead(): {
                console.log("symbolAllRead");
                emptied = true;
                clearInterval(iv);
                break;
            }
        }
    }
}
async function main() {
    let ts = new uif_next_symbol_js_1.NextSymbol({ concurrentTaskLimit: 2 });
    await Promise.all([consumer(ts), demo_lib_js_1.producer(ts)]);
}
//# sourceMappingURL=demo-next-symbol.js.map