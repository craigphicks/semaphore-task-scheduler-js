import type { Promolve } from './lib';
import { Common, CommonCtorParams } from './uif-common';
declare class NextSymbol extends Common {
    _result: Promolve;
    _error: Promolve;
    _qresults: unknown[];
    _qerrors: unknown[];
    _empty: Promolve;
    _symTaskResolved: symbol;
    _symTaskRejected: symbol;
    _symAllRead: symbol;
    constructor(...args: CommonCtorParams);
    getTaskResolvedValue(): any;
    getTaskRejectedValue(): any;
    symbolAllRead(): symbol;
    symbolTaskResolved(): symbol;
    symbolTaskRejected(): symbol;
    nextSymbol(): Promise<symbol>;
    getCountResolvedNotRead(): number;
    getCountRejectedNotRead(): number;
    getCountFinishedNotRead(): number;
}
export { NextSymbol };
