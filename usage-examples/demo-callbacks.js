'use strict';
const {Callbacks}=require('task-serializer');
const {producer}=require('./demo-lib.js');
async function consumer(ts){
  await new Promise((resolve)=>{
    ts.onTaskResolved((resolvedValue)=>{
      console.log(`onTaskResolved ${resolvedValue}`);
    });
    ts.onTaskRejected((rejectedValue)=>{
      console.log(`onTaskRejected ${rejectedValue}`);
    });
    ts.onEmpty(()=>{
      console.log(`onEmpty`);
      resolve();
    });
  });
  console.log('consumer finished');
}
async function main(){
  let ts=new Callbacks({concurrentTaskLimit:2});
  await Promise.all([
    consumer(ts),// consumer must initialize first
    producer(ts)
  ]);
}
main()
  .then(()=>{console.log('success');})
  .catch((e)=>{console.log('failure '+e.message);});
