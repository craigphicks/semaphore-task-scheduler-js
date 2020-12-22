import type {Promolve} from './lib';
import {makePromolve} from './lib';
import {Common, CommonCtorParams} from './uif-common';

class AsyncIter extends Common {
  _q: unknown[];
  _qe: unknown[];
  _nextpr: Promolve;
  _emptyFlag: boolean;
  _asyncIterable; // fortunately it deduces the type automatically

  constructor(...args: CommonCtorParams) {
    super(...args);
    this._q = [];
    this._qe = [];
    this._nextpr = makePromolve();
    this._emptyFlag = false;
    this._ts.onTaskResolved(
      ((retval: unknown) => {
        this._q.push(retval);
        this._nextpr.resolve();
      }).bind(this)
    );
    this._ts.onTaskRejected(
      ((e: unknown) => {
        this._qe.push(e);
        this._nextpr.resolve();
      }).bind(this)
    );
    this._ts.onEmpty(
      (() => {
        this._emptyFlag = true;
        this._nextpr.resolve();
      }).bind(this)
    );
    this._asyncIterable = this._createAsyncIterable();
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  _createAsyncIterable() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this;
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async next(): Promise<{done: false; value: any} | {done: true}> {
        for (let iter = 0; ; iter++) {
          if (that._qe.length)
            // errors have priority
            throw that._qe.splice(0, 1)[0];
          if (that._q.length)
            // "normal" return
            return {done: false, value: that._q.splice(0, 1)};
          // empty flag may be set before q,qe are drained so check this last
          // "empty" only means the sts member is empty, not ourself.
          if (that._emptyFlag) return {done: true};
          if (iter > 0)
            throw new Error(
              `asyncIterator.next, unexpected error iter==${iter}`
            );
          // wait here on promise (only once) until new data is ready
          await that._nextpr.promise;
          that._nextpr = makePromolve();
        }
      },
    };
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  [Symbol.asyncIterator]() {
    return this._asyncIterable;
  }
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  next() {
    return this._asyncIterable.next();
  }
  // informationals
  getCountResolvedNotRead(): number {
    return this._q.length;
  }
  getCountRejectedNotRead(): number {
    return this._qe.length;
  }
  getCountFinishedNotRead(): number {
    return this._q.length + this._qe.length;
  }
}

export {AsyncIter};
