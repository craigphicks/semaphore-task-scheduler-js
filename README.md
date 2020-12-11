copyright 2020 craigphicks ISC license

TaskSerializer
---

# Outline
The `TaskSerializer` module can serialize tasks/promises for integrated control - Tasks/promises can be added immediately as they are produced and placed in a pipline to be made available to a consumer when they have resolved and when the consumer is ready.  
Optionally, the number of concurrently running tasks are limited to a user parameter. In that special case, only functions (and their args) may be added to the pipeline, and function will be executed when a space is available. Trying to add promises will throw an Error.
Errors are prioritized to be presented before the results on normally returning tasks.  (Except for the case of `WaitAll.waitAllSettled`.)
All rejected promises are "defused", so that they don't throw unhandled exceptions while rejecting in the pipeline.  
The are 4 different classes exported from the module:
  - `AsyncIter`
  - `NextSymbol`
  - `WaitAll`
  - `Callbacks`
Each of those classes has these input functions:
  - `addTask(func,...args)`/`addTask(promise)` to add tasks/promises.
  - `addEnd()` to indicate that no more tasks/promises will be added, thus allowing exit after the pipeline has drained.
The output interface of each of those classes differ, and are suitable for different usage cases.  The following table compares some properties of those classes to help decide which is suitable for a given usage case:

| property    |`AsyncIter`|`NextSymbol`|`WaitAll`|`Callbacks`| 
|--           |--         |--          |--       |--         |
| internal pipeline | yes | yes        | yes     | no        |
| continuous vs. batch |cont | cont    | batch   | cont      |
| control loop | yes      | yes        | no      | no        |
| select style | no       | yes        | N/A     | N/A       |

where 'property' are as follows:
  - 'internal pipeline':
    - Whether the class has an internal pipeline storing the finshed tasks until they are read.
  - 'continuous vs. batch': 
    - Batch indicates the internal pipeline holds all task until processing is finished. 
    - Continous indicates the internal pipeline is read from during processing.
  - 'control loop'
    - The output may be easily read in an asynchrous control loop 
  - 'select style'
    - The control loop condition informs an output is 'ready' without actually reading it.  This style is useful for a top level control loop integrating 'ready' conditions from many unrelated sources. (Demonstrated in example `NextSymbol` usage.)

# Usage examples

## Note on shared demo functions

To make the examples more readable, some shared demo functions are used, and those shared functions are listed at the end of the examples (so as not to distract.)  One of those functions is the async function `producer(ts)`. It inputs the tasks by calling `addTask(...)` staggered over time. Some of those tasks throw `Errors`, other resolve normally. Finally `producer` ends the input calling `addEnd()`.   
All the example code is availalable in the `example-usages` subdirectory of the installed node module, e.g., `node_modules/task-serializer/demo-usages`.

## `AsyncIter` usage example
```js
'use strict';
const {AsyncIter}=require('task-serializer');
const {exitOnBeforeExit,producer}=require('./demo-lib.js');
async function consumer(ai){
  do{
    try{
      for await(const res of ai){
        console.log('    '+JSON.stringify(res));
      }
      break;
    }catch(e){
      console.log('    '+'error: '+e.message);
    }
  }while(true);
}
async function main(){
  let ai=new AsyncIter(2);
  await Promise.all([producer(ai),consumer(ai)]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});
```
## `NextSymbol` usage example
```js
'use strict';
const {NextSymbol}=require('task-serializer');
const {makepr,exitOnBeforeExit,producer}=require('./demo-lib.js');
var somethingElse=makepr();
var iv=setInterval(()=>{somethingElse.resolve("somethingElse");},300);  
async function consumer(ts){
  let emptied=false;
  while(!emptied){
    let next = await Promise.race([
      somethingElse.promise,
      ts.nextSymbol(),
    ]);
    switch(next){
    case "somethingElse":
      console.log(next);
      somethingElse=makepr();// reset
      break;
    case ts.symbolTaskEnd():{
      console.log();
      let res=ts.getTaskEnd();
      console.log("symbolTaskEnd, result="+res);
      break;}
    case ts.symbolTaskError():{
      let e=ts.getTaskError();
      console.log("symbolTaskError, message="+e.message);
      break;}
    case ts.symbolEmpty():{
      console.log("symbolEmpty");
      emptied=true;
      clearInterval(iv);
      break;}
    }
  }
}
async function main(){
  let ts=new NextSymbol({concurrentTaskLimit:2});
  await Promise.all([consumer(ts),producer(ts)]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure: '+e.message);process.exitCode=1;});
```
## `WaitAll` usage example
```js
'use strict';
const {WaitAll}=require('task-serializer');
const {exitOnBeforeExit,producer}=require('./demo-lib.js');
async function consumer(ts){
  try{
    let r=await ts.waitAll();
    console.log(`ts.waitAll() returned`);
    console.log(JSON.stringify(r,0,2));
  }catch(e){
    console.log(`ts.waitAll() caught ${e.message}`);
  }
  let r=await ts.waitAllSettled();
  console.log(`ts.waitAllSettled() returned`);
  console.log(JSON.stringify(r,0,2));
  console.log('consumer finished');
}
async function main(){
  let waitAll=new WaitAll({concurrentLimit:2});
  await Promise.all([
    consumer(waitAll),
    producer(waitAll),
  ]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});
```
## `Callbacks` usage example
```js
'use strict';
const {Callbacks}=require('task-serializer');
const {exitOnBeforeExit,producer}=require('./demo-lib.js');
async function consumer(ts){
  await new Promise((resolve)=>{
    ts.onTaskEnd((result)=>{
      console.log(`onTaskEnd ${result}`);
    });
    ts.onTaskError((err)=>{
      console.log(`onTaskError ${err}`);
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
```
## `demo-lib.js`
```js
function snooze(ms){return new Promise(r=>setTimeout(r,ms));}
function range(len){return [...Array(len).keys()];}
function exitOnBeforeExit(exitCode){
  process.on('beforeExit',async()=>{
    if (typeof process.exitCode=='undefined'){
      console.error('unexpected "beforeExit" event');
      process.exit(exitCode);
    } else 
      process.exit(process.exitCode);
  });
}
function makepr(){
  let pr={};
  pr.promise=new Promise((r)=>{pr.resolve=r;});
  return pr;
}
async function task(id,ms,err=false){
  console.log(`-->enter ${id}`);
  if (err)
    throw new Error(`task failed id=${id}`);
  await snooze(ms);
  console.log(`<--leave ${id}`);
  return `task ${id}, took ${ms}ms`;
}
async function producer(ts){
  for (let i=0; i<6; i++){
    ts.addTask(task,i,2**(10-i),(i+1)%3==0);
    await snooze(100);
  }
  ts.addEnd();
  console.log('producer finished');
}
```
# APIs
## API shared by all classes
- `addTask(func,...args)`
- `addEnd()`

## `AsyncIter` only API
- explicit `next()` or implicit `for await(const iter of <AsyncIter instance>)`

## `NextSymbol` only API

## `WaitAll` only API

## `Callbacks` only API



