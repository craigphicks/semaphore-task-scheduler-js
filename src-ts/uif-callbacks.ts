/* eslint-disable no-unused-vars */

//import type {Promolve,} from './lib'
//import {makePromolve} from './lib'
import {
  Common,
  CommonCtorParams,
  TaskCallback,
  EmptyCallback,
} from './uif-common';

class Callbacks extends Common {
  constructor(...args: CommonCtorParams) {
    super(...args);
  }
  onTaskResolved(cb: TaskCallback): void {
    this._ts.onTaskResolved(cb);
  }
  onTaskRejected(cb: TaskCallback): void {
    this._ts.onTaskRejected(cb);
  }
  onEmpty(cb: EmptyCallback): void {
    this._ts.onEmpty(cb);
  }
}
export {Callbacks};
