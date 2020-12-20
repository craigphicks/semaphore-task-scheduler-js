import { TaskSerializer } from './task-serializer';
declare namespace _ns {
    interface CtorArg2 {
        concurrentTaskLimit: number;
    }
    type Ctor1 = new (carg?: number) => never;
    type Ctor2 = new (carg: CtorArg2) => never;
    export type CommonCtorParams = ConstructorParameters<Ctor1> | ConstructorParameters<Ctor2>;
    export {};
}
declare type CommonCtorParams = _ns.CommonCtorParams;
declare class Common {
    _ts: TaskSerializer;
    constructor(...args: CommonCtorParams);
    addTask(func: Function, ...args: any[]): void;
    addTask(prom: Promise<any>): void;
    addEnd(): void;
    getCountWaiting(): number;
    getCountWorking(): number;
    getCountResolvedTotal(): number;
    getCountRejectedTotal(): number;
    getCountFinishedTotal(): number;
}
declare type EmptyCallback = () => void;
declare type TaskCallback = (value: any) => void;
export { Common, CommonCtorParams, TaskCallback, EmptyCallback };
