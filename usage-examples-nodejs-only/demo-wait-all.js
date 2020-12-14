'use strict';
const {WaitAll}=require('task-serializer');
const {exitOnBeforeExit,producer}=require('./demo-lib.js');
async function consumer_waitAll(ts){
  try{
    let r=await ts.waitAll();
    console.log(`ts.waitAll() returned`);
    console.log(JSON.stringify(r,0,2));
  }catch(e){
    console.log(`ts.waitAll() caught ${e.message}`);
  }
}
async function consumer_waitAllSettled(ts){
  let r=await ts.waitAllSettled();
  console.log(`ts.waitAllSettled() returned`);
  console.log(JSON.stringify(r,0,2));
  console.log('consumer finished');
}
async function main(){
  let waitAll=new WaitAll({concurrentLimit:2});
  await Promise.all([
    consumer_waitAll(waitAll),
    producer(waitAll),
  ]);
  waitAll=new WaitAll({concurrentLimit:2});
  await Promise.all([
    consumer_waitAllSettled(waitAll),
    producer(waitAll),
  ]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});
exitOnBeforeExit(2);
