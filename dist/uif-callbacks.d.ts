import { Common, CommonCtorParams, TaskCallback, EmptyCallback } from './uif-common';
declare class Callbacks extends Common {
    constructor(...args: CommonCtorParams);
    onTaskResolved(cb: TaskCallback): void;
    onTaskRejected(cb: TaskCallback): void;
    onEmpty(cb: EmptyCallback): void;
}
export { Callbacks };
