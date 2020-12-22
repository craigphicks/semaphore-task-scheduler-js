import type {Promolve} from './lib';
import {makePromolve} from './lib';
import {EmptyCallback, TaskCallback} from './uif-common';
// type EmptyCallback=()=>void
// type TaskCallback=(value:any)=>void

// type Resolver=(value?:any)=>void
// interface Promolve{
//   promise:Promise<any>
//   resolve:Resolver
// }
class Semaphore {
  _concurrentLimit: number;
  _count: number;
  _resolveq: ((_: void) => void)[];
  constructor(concurrentLimit: number = 0) {
    this._concurrentLimit = concurrentLimit;
    this._count = concurrentLimit;
    this._resolveq = [];
  }
  async wait() {
    if (this._count > 0) {
      this._count--;
      return;
    }
    const pr = makePromolve();
    this._resolveq.push(pr.resolve);
    return pr.promise;
  }
  signal() {
    if (this._resolveq.length) this._resolveq.splice(0, 1)[0]();
    // resolve it
    else this._count++;
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
  _usingConcurrentLimit: boolean;
  _numResolved: number;
  _numRejected: number;
  _numAdded: number;
  _onEmptyCallback: EmptyCallback | null;
  _onTaskResolvedCallback: TaskCallback | null;
  _onTaskRejectedCallback: TaskCallback | null;
  _endFlag: boolean;
  _sem: Semaphore | null;

  constructor(concurrentLimit: number) {
    this._usingConcurrentLimit = concurrentLimit > 0;
    this._sem = null;
    if (this._usingConcurrentLimit) this._sem = new Semaphore(concurrentLimit);
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
  static _makepr(): Promolve {
    return makePromolve();
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTask(func: (...args: any[]) => unknown, ...args: any[]): void;
  addTask(prom: Promise<unknown>): void;
  addTask(...args: unknown[]): void {
    const func = args.shift();
    const p = (async () => {
      if (this._usingConcurrentLimit)
        // @ts-expect-error: Object is possibly 'null'.
        await this._sem.wait();
      try {
        let result;
        if (typeof func == 'function') result = await func(...args);
        else if (func instanceof Promise) {
          if (this._usingConcurrentLimit)
            throw new Error(
              'addTask, illogical to add promise when concurrent limit in use'
            );
          result = func; // OK
          if (args.length > 1)
            throw new Error(
              'addTask, extra parameters given after Promise type'
            );
        } else
          throw new Error(
            'addTask first arg must be instance of Function or Promise'
          );
        this._numResolved++;
        if (this._onTaskResolvedCallback) this._onTaskResolvedCallback(result);
        return result;
      } catch (e) {
        this._numRejected++;
        if (this._onTaskRejectedCallback) this._onTaskRejectedCallback(e);
        throw e;
      } finally {
        if (this._usingConcurrentLimit)
          // @ts-expect-error: Object is possibly 'null'.
          this._sem.signal();
        if (
          this._endFlag &&
          this.getWaitingCount() == 0 &&
          this.getWorkingCount() == 0
        ) {
          if (this._onEmptyCallback) this._onEmptyCallback();
        }
      }
    })();
    this._numAdded++;
    // eslint-disable-next-line no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    p.catch((e) => {}); // unhandledRejection-defuse, without this, boom!
    // if (this._taskq)
    //   this._taskq.push(p);// defused
    //return p;
  }
  addEnd(): void {
    this._endFlag = true;
    // this section required in case addEnd() is called after all
    // tasks have already finished, c.f. addTask() similar code.
    if (this.getWaitingCount() == 0 && this.getWorkingCount() == 0) {
      if (this._onEmptyCallback) this._onEmptyCallback();
    }
  }
  getWorkingCount(): number {
    return this._numAdded - this.getFinishedCount() - this.getWaitingCount();
  }
  getWaitingCount(): number {
    // @ts-expect-error: Object is possibly 'null'.
    return this._usingConcurrentLimit ? this._sem.getWaitingCount() : 0;
  }
  getFinishedCount(): number {
    return this.getResolvedCount() + this.getRejectedCount();
  }
  getResolvedCount(): number {
    return this._numResolved;
  }
  getRejectedCount(): number {
    return this._numRejected;
  }
  onEmpty(callback: EmptyCallback): void {
    this._onEmptyCallback = callback;
  }
  onTaskResolved(callback: TaskCallback): void {
    this._onTaskResolvedCallback = callback;
  }
  onTaskRejected(callback: TaskCallback): void {
    this._onTaskRejectedCallback = callback;
  }
}
export type {EmptyCallback, TaskCallback};
export {TaskSerializer};
