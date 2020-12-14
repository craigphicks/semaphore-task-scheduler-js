copyright 2020 craigphicks ISC license

TaskSerializer
---

# Outline
The `TaskSerializer` module can serialize tasks/promises for integrated control - Tasks/promises can be added immediately as they are produced and then be made available to a consumer when they have resolved and the consumer is ready to read them.  

Optionally, the number of concurrently running tasks are limited to a user parameter. In that special case, only functions (and their args) may be added, and function will be executed when a space is available. Trying to add promises will throw an Error.

The are 4 different classes exported from the module:
  - `AsyncIter`
  - `NextSymbol`
  - `WaitAll`
  - `Callbacks`

See [Essential Information](#essential-information) for a discussion of their behavior and differences.

The module is not dependent upon NodeJS, so can be used in browser code.

# Usage examples

## Note on shared demo functions

To make the examples more readable some shared function are used. [They are listed at the end](#demo-libjs) of the examples.  

One of those shared functions is the async function `producer()`. It inputs the tasks by calling `install.addTask(...)` staggered over time, followed by `install.addEnd()`. Some of those tasks throw `Errors`, other resolve normally.   

All the below example code is availalable in the `example-usages` subdirectory of the installed node module, e.g., `node_modules/task-serializer/usage-examples`.

## `AsyncIter` usage example
[API](#asynciter-only-api)
```js
'use strict';
const {AsyncIter}=require('task-serializer');
const {producer}=require('./demo-lib.js');
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
  .then(()=>{console.log('success');})
  .catch((e)=>{console.log('failure '+e.message);});
```

## `NextSymbol` usage example
[API](#nextsymbol-only-api)
```js
'use strict';
const {NextSymbol}=require('task-serializer');
const {makepr,producer}=require('./demo-lib.js');
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
    case ts.symbolAllRead():{
      console.log("symbolAllRead");
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
  .then(()=>{console.log('success');})
  .catch((e)=>{console.log('failure: '+e.message);});
```

## `WaitAll` usage examples
[API](#waitall-only-api)
```js
'use strict';
const {WaitAll}=require('task-serializer');
const {producer}=require('./demo-lib.js');
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
  .then(()=>{console.log('success');})
  .catch((e)=>{console.log('failure '+e.message);});
```

## `Callbacks` usage example
[API](#callbacks-only-api)
```js
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
  let ts=new Callbacks({concurrentLimit:2});
  await Promise.all([
    consumer(ts),// consumer must initialize first
    producer(ts)
  ]);
}
main()
  .then(()=>{console.log('success');})
  .catch((e)=>{console.log('failure '+e.message);});
```

## `demo-lib.js`
```js
'use strict';
var {AsyncIter,NextSymbol}=require('task-serializer');
function snooze(ms){return new Promise(r=>setTimeout(r,ms));}
function range(len){return [...Array(len).keys()];}
function makepr(){
  let pr={};
  pr.promise=new Promise((r)=>{pr.resolve=r;});
  return pr;
}
function logStatus(ts){
  let wa=ts.getCountWaiting();
  let wo=ts.getCountWorking();
  let rest=ts.getCountResolvedTotal();
  let rejt=ts.getCountRejectedTotal();
  let fint=ts.getCountFinishedTotal();
  console.log(
    `wa:${wa},wo:${wo},rest:${rest},rejt:${rejt},fint:${fint}`);
  if ((ts instanceof AsyncIter)||(ts instanceof NextSymbol)){
    let resnr=ts.getCountResolvedNotRead();
    let rejnr=ts.getCountRejectedNotRead();
    console.log(`resnr:${resnr},rejnr:${rejnr}`);
  }
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
module.exports.snooze=snooze;
module.exports.task=task;
module.exports.range=range;
module.exports.makepr=makepr;
module.exports.producer=producer;
```

# Esential Information

## Classes share common input functions
Each of the classes includes these input functions:
  - `addTask(func,...args)`/`addTask(promise)` to add tasks/promises.
  - `addEnd()` to indicate that no more tasks/promises will be added, thus allowing exit after the pipeline has drained.

## Classes have differing output functions and behavior
The output interface of each of those classes differ, and are suitable for different usage cases.  The following table compares some properties of those classes to help decide which is suitable for a given usage case:

| property    |`AsyncIter`|`NextSymbol`|`WaitAll`|`Callbacks`| 
|--           |--         |--          |--       |--         |
| read buffered | yes | yes        | yes     | no        |
| continuous vs. batch |cont | cont    | batch   | cont      |
| control loop | yes      | yes        | no      | no        |
| select style | no       | yes        | N/A     | N/A       |
||||||


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

## Resolve/Reject handling

All rejected tasks/promises are managed so that they don't throw unhandled rejections.

Read-buffered classes prioritize rejected-values over resolved-values, and pass the rejected-values first whenever both are availabe.  The exception to this rule is `WaitAll.waitAllSettled()`, which transforms rejected-values into resolved-values.

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
    - This milestone is seperate from *finished* only in the read-buffered classes `AsyncIter`,`NextSymbol`, and `WaitAll`.  In the case of class `Callbacks`, one of the `onTaskResolved`/`onTaskRejected` callbacks is called immediately when *finished* is reached, so *read* and *finished* are reached simultaneously.
    - Task/promise outcome has been read by the consumer.  

- The class instance passes through the following milestones, in order:
  - *started-processing*
    - First task/promise has been *added*.
  - *ended*
    - `addEnd` has been called to guarantee no more tasks/promises will be added. 
  - *all-finished*
    - `addEnd` has been called and all *added* tasks/promises have reached *finished*.
  - *all-read*
    - This milestone is seperate from *all-finished* only for the read-buffered classes `AsyncIter`, `NextSymbol`, and `WaitAll`.  In the case of `Callbacks`, one of the callbacks `onResolved`/`onRejected` will be called immediately upon reaching *finished*. 

## Termination

There is no active termination method, but there is passive termination when `instance` is no longer referenced, or processing is deliberately abandoned.

The following two cases are important:
- *termination-after-all-finished*
  - In this case the only possible references in the class state are to a buffer of read values.  The class will successfully be garbage collected.
- *termination-before-all-finished*
  - In this case at least one task/promise has not resolved or rejected.  The class is not guaranteed to garbage collect in this case.  However, if the JS engine is able to determine that for each task/promise not resolved or rejected, that task/promise is deadlocked(/*), then the class might be garbage collected.  

(/*) 'Deadlocked' means a task/promise is waiting on a promise, but there is no possibility that the waited-on-promise can be resolved.  The prototypical example of such a promise is `new Promise(()=>{})`.  More typically interconnected promises deadlock in a practical example of the [Dining Philosopher's Problem](https://en.wikipedia.org/wiki/Dining_philosophers_problem).  Note that in JS, this will NOT happen to a promise directly or indirectly waiting upon external input, e.g., when waiting upon `process.stdin` while `process.stdin` is active.  

In case of running under nodeJS, There is another important termination case:

- *termination-due-to-unexpected-deadlock*
  - In the case of nodeJS, when the internal nodeJS event queue becomes empty, nodeJS may decide that the async function referencing our class `instance` is deadlocked, and cause that async function to return. This can be very confusing.  However, in the author's experience, the deadlock is always real - i.e., it is due to programmer error.

  - The nodeJS function `process.onBeforeExit()`, can be helpful in diagnosing unexpected deadlock.  It sets a callback which will be called when nodeJS diagnoses the whole program as being "in deadlock". Example code using `process.onBeforeExit()` can found under the node module `node_modules/task-serializer/usage-examples-nodejs-only/demo-lib.js`.

# APIs

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

The following are informational functions common to all the classes.

- `instance.getCountWaiting()`
  - When the construct arg `concurrentTaskLimit<=0`, always returns `0`.
  - Otherwise, returns the number of tasks *added* but not yet *started*.
- `instance.getCountWorking()`
  - Returns the number of tasks/promises *started* but not yet *finished*.
- `instance.getCountResolvedTotal()`
  - Returns the number of tasks/promises *finished* with a *resolved-value*
- `instance.getCountRejectedTotal()`
  - Returns the number of tasks/promises *finished* with a *rejected-value*
- `instance.getCountFinishedTotal()`
  - Returns the sum of `instance.getCountResolvedTotal()` and `instance.getCountRejectedTotal()`

The following are informational functions available only in the read-buffered classes `AsyncIter` and `NextSymbol`:

- `instance.getCountResolvedNotRead()`
  - Returns the number of tasks/promises *finished* with a *resolved-value*, but which are not yet *read*
- `instance.getCountRejectedNotRead()`
  - Returns the number of tasks/promises *finished* with a *rejected-value*, but which are not yet *read*
- `instance.getCountFinishedNotRead()`
  - Returns the sum of `instance.getCountResolvedNotRead()` and `instance.getCountRejectedNotRead()`

## `AsyncIter` only API
- see [`AsyncIter` usage example](#asynciter-usage-example) for example.
- `const {AsyncIter}=require('task-serializer')`
- `instance=new AsyncIter({concurrentTaskLimit=0}={})`
  - See [API shared by all classes](#api-shared-by-all-classes).
- explicit async `instance.next()` or implicit async `for await (iter of instance)`
  - There are 3 possible outcome categories: *resolved-value*, *rejected-value*, and *all-read*, where *all-read* indicates that the instance has reached the *all-read* milestone.
  - case: explicit
    - case: *resolved-value*
      - returns `{done:false,value:<resolved-value>}`
    - case: *rejected-value*
      - throws `<rejected-value>`
    - case: *all-read*
      - returns `{done:true}`
  - case: implicit
    - case: *resolved-value*
      - `iter` will be the `<resolved-value>` 
    - case: *rejected-value*
      - throws `<rejected-value>`
    - case: *all-read*
      - breaks from loop.
  
## `NextSymbol` only API
- see [`NextSymbol` usage example](#nextsymbol-usage-example) for example.
- `const {NextSymbol}=require('task-serializer')`
- `instance=new NextSymbol({concurrentTaskLimit=0}={})`
  - See [API shared by all classes](#api-shared-by-all-classes).
- async `instance.nextSymbol()`
  Returns a value strictly equal to one of `instance.symbolTaskResolved()`, `instance.symbolTaskRejected()`, or `instance.symbolAllRead()`.
  - case `instance.symbolTaskResolved()`: indicates a task/promise *resolved-value* is ready to be read.
  - case `instance.symbolTaskRejected()`: indicates a task/promise *rejected-value* is ready to be read.
  - case `instance.symbolAllRead()`: indicates the instance milestone *all-read* has been reached.
- `instance.getTaskResolvedValue()`
  - This is a sync function intended to be called immediately after `async instance.nextSymbol()` has returned a value equal to `instance.symbolTaskResolved()`
  - It returns the next *resolved-value* of some task/promise.
- `instance.getTaskRejectedValue()`
  - This is a sync function intended to be called immediately after `async instance.nextSymbol()` has returned a value equal to `instance.symbolTaskRejected()`
  - It returns the next *rejected-value* of some task/promise.

## `WaitAll` only API
- see [`WaitAll` usage examples](#waitall-usage-examples) for example.
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
- see [`Callbacks` usage example](#callbacks-usage-example) for example.
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


