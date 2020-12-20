"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exitOnBeforeExit = exports.producer = exports.makepr = exports.range = exports.task = exports.snooze = void 0;
import {AsyncIter,NextSymbol} from 'task-serializer';
function snooze(ms) { return new Promise(r => setTimeout(r, ms)); }
exports.snooze = snooze;
function range(len) { return [...Array(len).keys()]; }
exports.range = range;
function makepr() {
    let pr = {};
    // @ts-expect-error
    pr.promise = new Promise((r) => { pr.resolve = r; });
    // @ts-expect-error
    return pr;
}
exports.makepr = makepr;
function logStatus(ts) {
    let wa = ts.getCountWaiting();
    let wo = ts.getCountWorking();
    let rest = ts.getCountResolvedTotal();
    let rejt = ts.getCountRejectedTotal();
    let fint = ts.getCountFinishedTotal();
    console.log(`wa:${wa},wo:${wo},rest:${rest},rejt:${rejt},fint:${fint}`);
    if ((ts instanceof index_1.AsyncIter) || (ts instanceof index_1.NextSymbol)) {
        let resnr = ts.getCountResolvedNotRead();
        let rejnr = ts.getCountRejectedNotRead();
        let finnr = ts.getCountFinishedNotRead();
        console.log(`resnr:${resnr},rejnr:${rejnr},finnr:${finnr}`);
    }
}
async function task(id, ms, err = false) {
    console.log(`-->enter ${id}`);
    if (err)
        throw new Error(`task failed id=${id}`);
    await snooze(ms);
    console.log(`<--leave ${id}`);
    return `task ${id}, took ${ms}ms`;
}
exports.task = task;
async function producer(ts) {
    for (let i = 0; i < 6; i++) {
        //--IF{{RELEASE}}
        //--ELSE
        logStatus(ts);
        //--ENDIF
        ts.addTask(task, i, 2 ** (10 - i), (i + 1) % 3 == 0);
        await snooze(100);
    }
    //--IF{{RELEASE}}
    //--ELSE
    logStatus(ts);
    //--ENDIF
    ts.addEnd();
    console.log('producer finished');
}
exports.producer = producer;
//# sourceMappingURL=demo-lib.js.map