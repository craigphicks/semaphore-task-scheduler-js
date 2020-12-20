import type { Promolve } from './lib';
import { Common, CommonCtorParams } from './uif-common';
declare class NextSymbol extends Common {
    _result: Promolve;
    _error: Promolve;
    _qresults: any[];
    _qerrors: any[];
    _empty: Promolve;
    _symTaskResolved: Symbol;
    _symTaskRejected: Symbol;
    _symAllRead: Symbol;
    constructor(...args: CommonCtorParams);
    getTaskResolvedValue(): any;
    getTaskRejectedValue(): any;
    symbolAllRead(): Symbol;
    symbolTaskResolved(): Symbol;
    symbolTaskRejected(): Symbol;
    nextSymbol(): Promise<Symbol>;
    getCountResolvedNotRead(): number;
    getCountRejectedNotRead(): number;
    getCountFinishedNotRead(): number;
}
export { NextSymbol };
