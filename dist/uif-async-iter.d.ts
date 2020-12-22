import type { Promolve } from './lib';
import { Common, CommonCtorParams } from './uif-common';
declare class AsyncIter extends Common {
    _q: unknown[];
    _qe: unknown[];
    _nextpr: Promolve;
    _emptyFlag: boolean;
    _asyncIterable: {
        next(): Promise<{
            done: false;
            value: any;
        } | {
            done: true;
        }>;
    };
    constructor(...args: CommonCtorParams);
    _createAsyncIterable(): {
        next(): Promise<{
            done: false;
            value: any;
        } | {
            done: true;
        }>;
    };
    [Symbol.asyncIterator](): {
        next(): Promise<{
            done: false;
            value: any;
        } | {
            done: true;
        }>;
    };
    next(): Promise<{
        done: false;
        value: any;
    } | {
        done: true;
    }>;
    getCountResolvedNotRead(): number;
    getCountRejectedNotRead(): number;
    getCountFinishedNotRead(): number;
}
export { AsyncIter };
