copyright 2020 craigphicks ISC license

TaskSerializer
---

# Outline
The `TaskSerializer` module can serialize tasks/promises for integrated control - Tasks/promises can be added immediately as they are produced and placed in a pipline to be made available to a consumer when they have resolved and when the consumer is ready.  
Optionally, the number of concurrently running tasks are limited to a user parameter. In that special case, only functions (and their args) may be added, and function will be executed when a space is available. Trying to add promises will throw an Error.
Errors are prioritized to be presented before the results on normally returning tasks.  (Except for the case of `WaitAll.waitAllSettled`.)
All rejected tasks/promises are managed so that they don't throw unhandled rejections.
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
| read buffered | yes | yes        | yes     | no        |
| continuous vs. batch |cont | cont    | batch   | cont      |
| control loop | yes      | yes        | no      | no        |
| select style | no       | yes        | N/A     | N/A       |

where 'property' are as follows:
  - 'read buffered':
    - Whether the class has an internal buffer storing the outcomes of finished tasks/promises until they are read by the consumer.
  - 'continuous vs. batch': 
    - Batch indicates either:
      - no consumer read until all tasks/promises have resolved, or until any tak/poromise has rejected (`WaitAll.waitAll`)
      - no consumer read until all tasks/promises have either resolved or rejected (`WaitAll.waitAllSettled`)
    - Continous indicates the internal read buffer is intended to be read by consumers before all taks/promises have resolved/rejected.
  - 'control loop'
    - The output may be easily read in an asynchrous control loop 
  - 'select style'
    - The control loop condition informs an output is 'ready' without actually reading it.  This style is useful for a top level control loop integrating 'ready' conditions from many unrelated sources. (See [`NextSymbol` usage example](#nextsymbol-usage-example).)

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
    case ts.symbolTaskResolved():{
      console.log();
      let res=ts.getTaskResolvedValue();
      console.log("symbolTaskResolved, result="+res);
      break;}
    case ts.symbolTaskRejected():{
      let e=ts.getTaskRejectedValue();
      console.log("symbolTaskRejected, message="+e.message);
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

## `WaitAll` usage examples
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

## Terminology

- Each task/promise after being added will go through all of the following milestones in order:
  - *added*
    - The task has been added with `addTask`.
  - *started*
    - If the construtor parameter `concurrentTaskLimit`>0, then a task may be forced to wait before start.
    - If the construtor parameter `concurrentTaskLimit`<=0, that all task/promises are (considered) *started* when *added*.  
  - *finished*
    - Task/promise has reached an outcome, either one of the following two categories: 
      - *resolved-value*
        - resulting from `resolve(<resolved-value>)` or `return <resolved-value>`
      - *rejected-value* 
        - resulting from ``reject(<rejected-value>)` or `throw <rejected value>`
        - The actual values are determined by the task/promise, not by the `TaskSerializer` module.  A rejected-value typically satisfies `(<rejected-value> instanceof Error)`, but that is not mandatory.  
  - *read*
    - Task/promise outcome has been read by the consumer.  This state might not be reached of reading is abandoned, e.g. due to a rejected-value.
- The class instance passed through the following milestones, in order:
  - *started-processing*
    - First task/promise has been *added*.
  - *ended*
    - `addEnd` has been called to guarantee no more tasks/promises will be added. 
  - *finished-processing*
    - `addEnd` has been called and all *added* tasks have reached *finished*.
  - *empty*
    - `addEnd` has been called and all *added* tasks have reached *read*.

## API shared by all classes
- `instance=new <Classname>({concurrentTaskLimit=0}={})`
  - where `<Classname>` is one of `AsyncIter`,`Callbacks`,`NextSymbol`,or `WaitAll`.
  - `concurrentTaskLimit` is the integer number of task allowed to run concurrently, unless it is `<=0`, in which case their is no limit.  
- `instance.addTask(func,...args)` where `(func instanceof Function)`, or `addTask(promise)` where `(promise instanceof Promise)`
  - in the case of constructor arg `concurrentTaskLimit>0`, 
    - `addTask` will allow only the first form, and passing a promise will throw. 
    - `func(...args)` will be called in the order passed, when the concurrent task limit constraint allows.  
  - in the case of constructor arg `concurrentTaskLimit<=0`, either form is allowed.
  - in either case, the tasks/promises are managed by the instance of `<Classname>` until reaching miletone *read*. The tasks/promises may reject, and those rejections are handled to prevent unhandled promise rejections.    
- `instance.addEnd()`
  - this a guarantee from the caller that `addTask` will not be called again.  It is required so the instance knows that when all tasks/promises have reached the *finished* milestone, the instance has reached the *finished-processing* milestone.
- Generally, when possible, *rejected-values* are passed to the consumer before *resolved-values*. `WaitAll.waitAllSettled()` is one exception to that rule. 

## `AsyncIter` only API
- see [?]() for example.
- `const {AsyncIter}=require('task-serializer')`
- `instance=new AsyncIter({concurrentTaskLimit=0}={})`
  - See [API shared by all classes](#api-shared-by-all-classes).
- explicit async `instance.next()` or implicit async `for await (iter of instance)`
  - There are 3 possible outcome categories: *resolved-value*, *rejected-value*, and *instance-empty*, where *instance-empty* indicated the instance has reached the *empty* milestone.
  - case: explicit
    - case: *resolved-value*
      - returns `{done:false,value:<resolved-value>}`
    - case: *rejected-value*
      - throws `<rejected-value>`
    - case: *instance-empty*
      - returns `{done:true}`
  - case: implicit
    - case: *resolved-value*
      - `iter` will be the `<resolved-value>` 
    - case: *rejected-value*
      - throws `<rejected-value>`
    - case: *instance-empty*
      - breaks from loop.
  
## `NextSymbol` only API
- see [?]() for example.
- `const {NextSymbol}=require('task-serializer')`
- `instance=new NextSymbol({concurrentTaskLimit=0}={})`
  - See [API shared by all classes](#api-shared-by-all-classes).
- async `instance.nextSymbol()`
  Returns a value strictly equal to one of `instance.symbolTaskResolved()`, `instance.symbolTaskRejected()`, or `instance.symbolEnd()`.
  - case `instance.symbolTaskResolved()`: indicates a task/promise *resolved-value* is ready to be read.
  - case `instance.symbolTaskRejected()`: indicates a task/promise *rejected-value* is ready to be read.
  - case `instance.symbolTaskResolved()`: indicates the instance milestone *empty* has been reached.
- `instance.getTaskResolvedValue()`
  - This is a sync function intended to be called immediately after `async instance.nextSymbol()` has returned a value equal to `instance.symbolTaskResolved()`
  - It returns the next *resolved-value* of some task/promise.
- `instance.getTaskRejectedValue()`
  - This is a sync function intended to be called immediately after `async instance.nextSymbol()` has returned a value equal to `instance.symbolTaskRejected()`
  - It returns the next *rejected-value* of some task/promise.

## `WaitAll` only API
- see [?]() for example.
- `const {WaitAll}=require('task-serializer')`
- `instance=new WaitAll({concurrentTaskLimit=0}={})`
  - See [API shared by all classes](#api-shared-by-all-classes).
- async `instance.waitAll()`
  - There is no timing constraint on calling `waitAll`, i.e. no requirement to call before after any instance milestone, although obviously milestone *empty* is not reached until `waitAll` is called. 
  - If any tasks/promises have terminated with an error before the call to `addTask`, then that first one will be returned immediately when `waitAll` is called.
  - If any tasks/promises have terminated with an error after `addTask` is called, `waitAll` will immediately return with that error.
  - Otherise `waitAll` will not return before all the tasks/promises added with `addTask` have terminated, and the array of resolved-values will be the order they were added, not the order they were resolved. 
- async `instance.waitAllSettled()`
  - There is no timing constraint on calling `waitAllSettled()`.  Any time from before the first `addTask` to after all tasks/promises have terminated (i.e., end-of-processing) is allowed. Measures have been taken to prevent unhandled rejections.
  - `waitAllSettled` will return no sooner than end-of-processing.  It will return the same value as [`Promise.waitAllSettled()`](https://javascript.info/promise-api#promise-allsettled) would return on an array of all tasks/promises added via `addTask` in the order the were added.

## `Callbacks` only API
- see [?]() for example.
- `const {Callbacks}=require('task-serializer')`
- `instance=new Callbacks({concurrentTaskLimit=0}={})`
  - See [API shared by all classes](#api-shared-by-all-classes).
- `instance.onTaskResolved(callback)`
  - add the unique callback to be called every time a task/promise *resolved-result* is ready
- `instance.onTaskRejected(callback)`
  - add the unique callback to be called every time a task/promise *rejected-result* is ready
- `instance.onEmpty(callback)`
  - add the unique callback to be called when the instance reaches the *empty* milestone.
- NOTES:
  - Each `instance.on<*>` function should be called only once per instance.  Only one callback per function is actually registered.
  - Each `instance.on<*>`function must be called before the instance has reached the *processing* milestone, i.e., before the first call to `addTask`.




