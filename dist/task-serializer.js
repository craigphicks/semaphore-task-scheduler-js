"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSerializer = void 0;
const lib_1 = require("./lib");
// type EmptyCallback=()=>void
// type TaskCallback=(value:any)=>void
// type Resolver=(value?:any)=>void
// interface Promolve{
//   promise:Promise<any>
//   resolve:Resolver
// }
class Semaphore {
    constructor(concurrentLimit = 0) {
        this._concurrentLimit = concurrentLimit;
        this._count = concurrentLimit;
        this._resolveq = [];
    }
    wait() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._count > 0) {
                this._count--;
                return;
            }
            const pr = lib_1.makePromolve();
            this._resolveq.push(pr.resolve);
            return pr.promise;
        });
    }
    signal() {
        if (this._resolveq.length)
            this._resolveq.splice(0, 1)[0]();
        // resolve it
        else
            this._count++;
    }
    getCount() {
        return this._count;
    }
    getconcurrentLimit() {
        return this._concurrentLimit;
    }
    getWaitingCount() {
        return this._resolveq.length;
    }
}
class TaskSerializer {
    constructor(concurrentLimit) {
        this._usingConcurrentLimit = concurrentLimit > 0;
        this._sem = null;
        if (this._usingConcurrentLimit)
            this._sem = new Semaphore(concurrentLimit);
        this._numAdded = 0;
        //this._numFinished=0;
        // each finished with be either resolved or rejected
        this._numResolved = 0;
        this._numRejected = 0;
        this._onEmptyCallback = null;
        this._onTaskResolvedCallback = null;
        this._onTaskRejectedCallback = null;
        this._endFlag = false;
    }
    static _makepr() {
        return lib_1.makePromolve();
    }
    addTask(...args) {
        const func = args.shift();
        const p = (() => __awaiter(this, void 0, void 0, function* () {
            if (this._usingConcurrentLimit)
                // @ts-expect-error: Object is possibly 'null'.
                yield this._sem.wait();
            try {
                let result;
                if (typeof func == 'function')
                    result = yield func(...args);
                else if (func instanceof Promise) {
                    if (this._usingConcurrentLimit)
                        throw new Error('addTask, illogical to add promise when concurrent limit in use');
                    result = func; // OK
                    if (args.length > 1)
                        throw new Error('addTask, extra parameters given after Promise type');
                }
                else
                    throw new Error('addTask first arg must be instance of Function or Promise');
                this._numResolved++;
                if (this._onTaskResolvedCallback)
                    this._onTaskResolvedCallback(result);
                return result;
            }
            catch (e) {
                this._numRejected++;
                if (this._onTaskRejectedCallback)
                    this._onTaskRejectedCallback(e);
                throw e;
            }
            finally {
                if (this._usingConcurrentLimit)
                    // @ts-expect-error: Object is possibly 'null'.
                    this._sem.signal();
                if (this._endFlag &&
                    this.getWaitingCount() == 0 &&
                    this.getWorkingCount() == 0) {
                    if (this._onEmptyCallback)
                        this._onEmptyCallback();
                }
            }
        }))();
        this._numAdded++;
        // eslint-disable-next-line no-unused-vars
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        p.catch((e) => { }); // unhandledRejection-defuse, without this, boom!
        // if (this._taskq)
        //   this._taskq.push(p);// defused
        //return p;
    }
    addEnd() {
        this._endFlag = true;
        // this section required in case addEnd() is called after all
        // tasks have already finished, c.f. addTask() similar code.
        if (this.getWaitingCount() == 0 && this.getWorkingCount() == 0) {
            if (this._onEmptyCallback)
                this._onEmptyCallback();
        }
    }
    getWorkingCount() {
        return this._numAdded - this.getFinishedCount() - this.getWaitingCount();
    }
    getWaitingCount() {
        // @ts-expect-error: Object is possibly 'null'.
        return this._usingConcurrentLimit ? this._sem.getWaitingCount() : 0;
    }
    getFinishedCount() {
        return this.getResolvedCount() + this.getRejectedCount();
    }
    getResolvedCount() {
        return this._numResolved;
    }
    getRejectedCount() {
        return this._numRejected;
    }
    onEmpty(callback) {
        this._onEmptyCallback = callback;
    }
    onTaskResolved(callback) {
        this._onTaskResolvedCallback = callback;
    }
    onTaskRejected(callback) {
        this._onTaskRejectedCallback = callback;
    }
}
exports.TaskSerializer = TaskSerializer;
//# sourceMappingURL=task-serializer.js.map