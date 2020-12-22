import type {Promolve} from './lib';
import {makePromolve} from './lib';
import {Common, CommonCtorParams} from './uif-common';

//const {TaskSerializer}=require('./task-serializer.js');
class NextSymbol extends Common {
  _result: Promolve;
  _error: Promolve;
  _qresults: unknown[];
  _qerrors: unknown[];
  _empty: Promolve;
  _symTaskResolved: symbol;
  _symTaskRejected: symbol;
  _symAllRead: symbol;

  constructor(...args: CommonCtorParams) {
    super(...args);
    this._result = makePromolve();
    this._error = makePromolve();
    this._qresults = [];
    this._qerrors = [];
    this._empty = makePromolve();
    this._ts.onTaskResolved((result: unknown) => {
      this._qresults.push(result);
      this._result.resolve();
    });
    this._ts.onTaskRejected((error: unknown) => {
      this._qerrors.push(error);
      this._error.resolve();
    });
    this._ts.onEmpty(() => {
      this._empty.resolve();
    });
    this._symTaskResolved = Symbol('TaskResolved');
    this._symTaskRejected = Symbol('TaskRejected');
    this._symAllRead = Symbol('AllRead');
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTaskResolvedValue(): any {
    if (!this._qresults.length)
      throw new Error('getTaskResolvedValue - not ready');
    if (this._qresults.length == 1) this._result = makePromolve();
    return this._qresults.splice(0, 1)[0];
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTaskRejectedValue(): any {
    if (!this._qerrors.length)
      throw new Error('getTaskRejectedValue - not ready');
    if (this._qerrors.length == 1) this._error = makePromolve();
    return this._qerrors.splice(0, 1)[0];
  }
  symbolAllRead(): symbol {
    return this._symAllRead;
  }
  symbolTaskResolved(): symbol {
    return this._symTaskResolved;
  }
  symbolTaskRejected(): symbol {
    return this._symTaskRejected;
  }
  nextSymbol(): Promise<symbol> {
    // this promise can be safely abandoned
    // Note: the order of promises ensures that this._symAllRead
    // won't be returned until all task results are actually read.
    return Promise.race([
      this._error.promise.then(() => {
        return this._symTaskRejected;
      }),
      this._result.promise.then(() => {
        return this._symTaskResolved;
      }),
      this._empty.promise.then(() => {
        return this._symAllRead;
      }),
    ]);
  }
  // informationals
  getCountResolvedNotRead(): number {
    return this._qresults.length;
  }
  getCountRejectedNotRead(): number {
    return this._qerrors.length;
  }
  getCountFinishedNotRead(): number {
    return this._qresults.length + this._qerrors.length;
  }
}
export {NextSymbol};
//module.exports.NextSymbol=NextSymbol;
