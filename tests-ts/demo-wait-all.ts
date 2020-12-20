'use strict';
//--IF{{RELEASE}}
//--import {WaitAll} from 'task-serializer';
//--ELSE
import {WaitAll} from '../dist/uif-wait-all.js';
//--ENDIF

//--IF{{NODEJS}}
import {exitOnBeforeExit,producer} from './demo-lib.js';
//--ELSE
//--import {producer} from './demo-lib.js';
//--ENDIF
async function consumer_waitAll(ts: WaitAll){
  try{
    let r=await ts.waitAll();
    console.log(`ts.waitAll() returned`);
    console.log(JSON.stringify(r,null,2));
  }catch(e){
    console.log(`ts.waitAll() caught ${e.message}`);
  }
}
async function consumer_waitAllSettled(ts: WaitAll){
  let r=await ts.waitAllSettled();
  console.log(`ts.waitAllSettled() returned`);
  console.log(JSON.stringify(r,null,2));
  console.log('consumer finished');
}
async function main(){
  let waitAll=new WaitAll({concurrentTaskLimit:2});
  await Promise.all([
    consumer_waitAll(waitAll),
    producer(waitAll),
  ]);
  waitAll=new WaitAll({concurrentTaskLimit:2});
  await Promise.all([
    consumer_waitAllSettled(waitAll),
    producer(waitAll),
  ]);
}
//--IF{{NODEJS}}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});
exitOnBeforeExit(2);
//--ELSE
//--main()
//--  .then(()=>{console.log('success');})
//--  .catch((e)=>{console.log('failure '+e.message);});
//--ENDIF
