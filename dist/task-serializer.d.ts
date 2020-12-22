import type { Promolve } from './lib';
import { EmptyCallback, TaskCallback } from './uif-common';
declare class Semaphore {
    _concurrentLimit: number;
    _count: number;
    _resolveq: ((_: void) => void)[];
    constructor(concurrentLimit?: number);
    wait(): Promise<void>;
    signal(): void;
    getCount(): number;
    getconcurrentLimit(): number;
    getWaitingCount(): number;
}
declare class TaskSerializer {
    _usingConcurrentLimit: boolean;
    _numResolved: number;
    _numRejected: number;
    _numAdded: number;
    _onEmptyCallback: EmptyCallback | null;
    _onTaskResolvedCallback: TaskCallback | null;
    _onTaskRejectedCallback: TaskCallback | null;
    _endFlag: boolean;
    _sem: Semaphore | null;
    constructor(concurrentLimit: number);
    static _makepr(): Promolve;
    addTask(func: (...args: any[]) => unknown, ...args: any[]): void;
    addTask(prom: Promise<unknown>): void;
    addEnd(): void;
    getWorkingCount(): number;
    getWaitingCount(): number;
    getFinishedCount(): number;
    getResolvedCount(): number;
    getRejectedCount(): number;
    onEmpty(callback: EmptyCallback): void;
    onTaskResolved(callback: TaskCallback): void;
    onTaskRejected(callback: TaskCallback): void;
}
export type { EmptyCallback, TaskCallback };
export { TaskSerializer };
