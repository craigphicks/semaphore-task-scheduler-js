//--IF{{RELEASE}}
//--import {AsyncIter,Callbacks,NextSymbol, WaitAll} from 'task-serializer';
//--ELSE
import {AsyncIter, Callbacks, NextSymbol, WaitAll} from '../dist/index';
//--ENDIF
function snooze(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
function range(len: number): number[] {
  return [...Array(len).keys()];
}
interface Promolve<T = void> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}
function makepr<T = void>(): Promolve<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pr: any = {};
  pr.promise = new Promise((r) => (pr.resolve = r));
  return pr as Promolve<T>;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logStatus(ts: AsyncIter | NextSymbol | Callbacks | WaitAll) {
  const wa = ts.getCountWaiting();
  const wo = ts.getCountWorking();
  const rest = ts.getCountResolvedTotal();
  const rejt = ts.getCountRejectedTotal();
  const fint = ts.getCountFinishedTotal();
  console.log(`wa:${wa},wo:${wo},rest:${rest},rejt:${rejt},fint:${fint}`);
  if (ts instanceof AsyncIter || ts instanceof NextSymbol) {
    const resnr = ts.getCountResolvedNotRead();
    const rejnr = ts.getCountRejectedNotRead();
    const finnr = ts.getCountFinishedNotRead();
    console.log(`resnr:${resnr},rejnr:${rejnr},finnr:${finnr}`);
  }
}
async function task(id: number, ms: number, err = false): Promise<string> {
  console.log(`-->enter ${id}`);
  if (err) throw new Error(`task failed id=${id}`);
  await snooze(ms);
  console.log(`<--leave ${id}`);
  return `task ${id}, took ${ms}ms`;
}
async function producer(
  ts: AsyncIter | NextSymbol | Callbacks | WaitAll
): Promise<void> {
  for (let i = 0; i < 6; i++) {
    //--IF{{RELEASE}}
    //--ELSE
    logStatus(ts);
    //--ENDIF
    ts.addTask(task, i, 2 ** (10 - i), (i + 1) % 3 == 0);
    await snooze(100);
  }
  //--IF{{RELEASE}}
  //--ELSE
  logStatus(ts);
  //--ENDIF
  ts.addEnd();
  console.log('producer finished');
}

export {snooze, task, range, makepr, producer};

//--IF{{NODEJS}}
function exitOnBeforeExit(exitCode: number): void {
  process.on('beforeExit', async () => {
    if (typeof process.exitCode == 'undefined') {
      console.error('unexpected "beforeExit" event');
      process.exit(exitCode);
    } else process.exit(process.exitCode);
  });
}
export {exitOnBeforeExit};
//--ENDIF
