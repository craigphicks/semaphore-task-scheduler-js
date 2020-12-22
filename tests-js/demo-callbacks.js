'use strict';
//--IF{{RELEASE}}
//--const {Callbacks}=require('task-serializer');
//--ELSE
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {Callbacks} = require('../dist/uif-callbacks.js');
//--ENDIF
//--IF{{NODEJS}}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {exitOnBeforeExit, producer} = require('./demo-lib.js');
//--ELSE
//--const {producer}=require('./demo-lib.js');
//--ENDIF
async function consumer(ts) {
  await new Promise((resolve) => {
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
  let ts = new Callbacks({concurrentTaskLimit: 2});
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
