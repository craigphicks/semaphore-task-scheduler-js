import type { Promolve } from './lib';
import { Common, CommonCtorParams } from './uif-common';
declare class WaitAll extends Common {
    _results: unknown[];
    _error: Promolve;
    _empty: Promolve;
    constructor(...args: CommonCtorParams);
    waitAll(): Promise<any | any[]>;
    waitAllSettled(): Promise<PromiseSettledResult<any>[]>;
}
export { WaitAll };
