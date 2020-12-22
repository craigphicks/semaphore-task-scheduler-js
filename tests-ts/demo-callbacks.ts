'use strict';
//--IF{{RELEASE}}
//--import {Callbacks} from 'task-serializer';
//--ELSE
import {Callbacks} from '../dist/uif-callbacks.js';
//--ENDIF
//--IF{{NODEJS}}
import {exitOnBeforeExit, producer} from './demo-lib.js';
//--ELSE
//--import {producer} from './demo-lib.js';
//--ENDIF
async function consumer(ts: Callbacks) {
  await new Promise<void>((resolve) => {
    ts.onTaskResolved((resolvedValue) => {
      console.log(`onTaskResolved ${resolvedValue}`);
    });
    ts.onTaskRejected((rejectedValue) => {
      console.log(`onTaskRejected ${rejectedValue}`);
    });
    ts.onEmpty(() => {
      console.log(`onEmpty`);
      resolve();
    });
  });
  console.log('consumer finished');
}
async function main() {
  const ts = new Callbacks({concurrentTaskLimit: 2});
  await Promise.all([
    consumer(ts), // consumer must initialize first
    producer(ts),
  ]);
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
