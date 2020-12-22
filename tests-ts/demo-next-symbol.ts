'use strict';
//--IF{{RELEASE}}
//--import {NextSymbol} from 'task-serializer';
//--ELSE
import {NextSymbol} from '../dist/uif-next-symbol.js';
//--ENDIF
//--IF{{NODEJS}}
import {exitOnBeforeExit, makepr, producer} from './demo-lib.js';
//--ELSE
//--import {makepr,producer} from './demo-lib.js';
//--ENDIF

let somethingElse = makepr<string>();
const iv = setInterval(() => {
  somethingElse.resolve('somethingElse');
}, 300);
async function consumer(ts: NextSymbol) {
  let emptied = false;
  while (!emptied) {
    const next = await Promise.race([somethingElse.promise, ts.nextSymbol()]);
    switch (next) {
      case 'somethingElse':
        console.log(next);
        somethingElse = makepr(); // reset
        break;
      case ts.symbolTaskResolved(): {
        console.log();
        const res = ts.getTaskResolvedValue();
        console.log('symbolTaskResolved, result=' + res);
        break;
      }
      case ts.symbolTaskRejected(): {
        const e = ts.getTaskRejectedValue();
        console.log('symbolTaskRejected, message=' + e.message);
        break;
      }
      case ts.symbolAllRead(): {
        console.log('symbolAllRead');
        emptied = true;
        clearInterval(iv);
        break;
      }
    }
  }
}
async function main() {
  const ts = new NextSymbol({concurrentTaskLimit: 2});
  await Promise.all([consumer(ts), producer(ts)]);
}
//--IF{{NODEJS}}
main()
  .then(() => {
    console.log('success');
    process.exitCode = 0;
  })
  .catch((e) => {
    console.log('failure ' + e.message);
    process.exitCode = 1;
  });
exitOnBeforeExit(2);
//--ELSE
//--main()
//--  .then(()=>{console.log('success');})
//--  .catch((e)=>{console.log('failure '+e.message);});
//--ENDIF
