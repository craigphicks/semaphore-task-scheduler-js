import type { Promolve } from './lib';
import { Common, CommonCtorParams } from './uif-common';
declare class WaitAll extends Common {
    _results: any[];
    _error: Promolve;
    _empty: Promolve;
    constructor(...args: CommonCtorParams);
    waitAll(): Promise<any[]>;
    waitAllSettled(): Promise<PromiseSettledResult<any>[]>;
}
export { WaitAll };
