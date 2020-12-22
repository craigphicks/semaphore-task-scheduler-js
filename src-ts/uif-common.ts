//import {Promolve} from './lib'
import {TaskSerializer} from './task-serializer';

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace _ns {
  interface CtorArg2 {
    concurrentTaskLimit: number;
  }
  type Ctor1 = new (carg?: number) => never;
  type Ctor2 = new (carg: CtorArg2) => never;
  export type CommonCtorParams =
    | ConstructorParameters<Ctor1>
    | ConstructorParameters<Ctor2>;
}
declare type CommonCtorParams = _ns.CommonCtorParams;
// interface CtorArg {concurrentTaskLimit:number}
// interface CommonCtor{
//   new (carg?:number):any
//   new (carg:CtorArg):any
// }
class Common {
  _ts: TaskSerializer;
  constructor(...args: CommonCtorParams) {
    let concurrentTaskLimit = 0;
    if (args.length) {
      if (typeof args[0] == 'number') concurrentTaskLimit = args[0];
      else if (
        typeof args[0] == 'object' &&
        typeof args[0].concurrentTaskLimit == 'number'
      )
        concurrentTaskLimit = args[0].concurrentTaskLimit;
      else throw new Error('illegal constructor parameter(s)');
    }
    this._ts = new TaskSerializer(concurrentTaskLimit);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTask(func: (...args: any[]) => unknown, ...args: any[]): void;
  addTask(prom: Promise<unknown>): void;
  addTask(...args: never[]): void {
    //this._ts.addTask(...args);
    this._ts.addTask(args[0], ...args.slice(1));
  }
  addEnd(): void {
    this._ts.addEnd();
  }
  getCountWaiting(): number {
    return this._ts.getWaitingCount();
  }
  getCountWorking(): number {
    return this._ts.getWorkingCount();
  }
  getCountResolvedTotal(): number {
    return this._ts.getResolvedCount();
  }
  getCountRejectedTotal(): number {
    return this._ts.getRejectedCount();
  }
  getCountFinishedTotal(): number {
    return this._ts.getFinishedCount();
  }
}

type EmptyCallback = () => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TaskCallback = (value: any) => void;

export {Common, CommonCtorParams, TaskCallback, EmptyCallback};
