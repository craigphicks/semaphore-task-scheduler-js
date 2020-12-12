'use strict';
//--IF{{RELEASE}}
//--const {Callbacks}=require('task-serializer');
//--ELSE
const {Callbacks}=require('./uif-callbacks.js');
//--ENDIF
//--STOP
const {exitOnBeforeExit,producer}=require('./demo-lib.js');

async function consumer(ts){
  await new Promise((resolve)=>{
    ts.onTaskResolved((result)=>{
      console.log(`onTaskResolved ${result}`);
    });
    ts.onTaskRejected((err)=>{
      console.log(`onTaskRejected ${err}`);
    });
    ts.onEmpty(()=>{
      console.log(`onEmpty`);
      resolve();
    });
  });
  console.log('consumer finished');
}
async function main(){
  let ts=new Callbacks({concurrentLimit:2});
  await Promise.all([
    consumer(ts),// consumer must initialize first
    producer(ts)
  ]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});

exitOnBeforeExit(2);
