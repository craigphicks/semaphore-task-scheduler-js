import type { Promolve } from './lib';
import { Common, CommonCtorParams } from './uif-common';
declare class AsyncIter extends Common {
    _q: any[];
    _qe: any[];
    _nextpr: Promolve;
    _emptyFlag: boolean;
    _asyncIterable: {
        next(): Promise<{
            done: boolean;
            value: any[];
        } | {
            done: boolean;
            value?: undefined;
        }>;
    };
    constructor(...args: CommonCtorParams);
    _reset_nextpr(): void;
    _createAsyncIterable(): {
        next(): Promise<{
            done: boolean;
            value: any[];
        } | {
            done: boolean;
            value?: undefined;
        }>;
    };
    [Symbol.asyncIterator](): {
        next(): Promise<{
            done: boolean;
            value: any[];
        } | {
            done: boolean;
            value?: undefined;
        }>;
    };
    next(): Promise<{
        done: boolean;
        value: any[];
    } | {
        done: boolean;
        value?: undefined;
    }>;
    getCountResolvedNotRead(): number;
    getCountRejectedNotRead(): number;
    getCountFinishedNotRead(): number;
}
export { AsyncIter };
