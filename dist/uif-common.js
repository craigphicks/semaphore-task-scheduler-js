"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Common = void 0;
//import {Promolve} from './lib'
const task_serializer_1 = require("./task-serializer");
// interface CtorArg {concurrentTaskLimit:number}
// interface CommonCtor{
//   new (carg?:number):any
//   new (carg:CtorArg):any
// }
class Common {
    constructor(...args) {
        let concurrentTaskLimit = 0;
        if (args.length) {
            if (typeof args[0] == 'number')
                concurrentTaskLimit = args[0];
            else if (typeof args[0] == 'object' &&
                typeof args[0].concurrentTaskLimit == 'number')
                concurrentTaskLimit = args[0].concurrentTaskLimit;
            else
                throw new Error('illegal constructor parameter(s)');
        }
        this._ts = new task_serializer_1.TaskSerializer(concurrentTaskLimit);
    }
    addTask(...args) {
        //this._ts.addTask(...args);
        this._ts.addTask(args[0], ...args.slice(1));
    }
    addEnd() {
        this._ts.addEnd();
    }
    getCountWaiting() {
        return this._ts.getWaitingCount();
    }
    getCountWorking() {
        return this._ts.getWorkingCount();
    }
    getCountResolvedTotal() {
        return this._ts.getResolvedCount();
    }
    getCountRejectedTotal() {
        return this._ts.getRejectedCount();
    }
    getCountFinishedTotal() {
        return this._ts.getFinishedCount();
    }
}
exports.Common = Common;
//# sourceMappingURL=uif-common.js.map