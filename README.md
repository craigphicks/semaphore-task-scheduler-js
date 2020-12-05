copyright 2020 craigphicks ISC license

# Outline
Throttle number of simulataneous tasks similarly (but not 
identically) to the traditional countable-semaphore paradigm used 
in multi-threading.

# Usage 
Example:
```
'use strict';
const {TaskScheduler}=require('task-scheduler');
function snooze(t){return new Promise((r)=>{setTimeout(r,t);});}
function status(sts){
  return `working:${sts.getWorkingCount()},`
  +`waiting:${sts.getWaitingCount()},finished:${sts.getFinishedCount()}`;
}
async function example(){
  let sts=new TaskScheduler(2,true);
  let myfunc=async(id,ms)=>{
    console.log(`entering ${id}`);
    await snooze(ms);
    console.log(`    leaving ${id}`);
  };
  for (let i=0;i<5; i++){
    sts.addTask(myfunc,i.toString(),13);
    await snooze(0);
    console.log(status(sts));
    await snooze(2);
  }
  await sts.waitAll();
  await snooze(0);
  console.log(status(sts));
}
example();
```
Output:
```
entering 0
working:1,waiting:0,finished:0
entering 1
working:2,waiting:0,finished:0
working:2,waiting:1,finished:0
working:2,waiting:2,finished:0
    leaving 0
entering 2
working:2,waiting:2,finished:1
    leaving 1
entering 3
    leaving 2
entering 4
    leaving 3
    leaving 4
working:0,waiting:0,finished:5
```

#APIs

## `TaskScheduler` API

  - constructor `TaskScheduler(initCount,useWaitAll)`
     - `initCount` : integer - maximum number of tasks allowed to execute simultaneously. No default value.
     - `queueTask` : boolean - if true than each added task will be stored in a queue for the sole reason that `waitAll` or `waitAllSettled` can be called. Default is `false`.  See `waitAll` or `waitAllSettled` for more details.
     - Caution: `true` could result in excessive memory usage.  
     - Returns the instance of `TaskScheduler`
  - `addTask(asyncFunc, ...args)`
     - `asyncFunc` is an asynchronous function to be executed when constraints permit.
     - `...args` are arbitray arguments to be applied to `asyncFunc` on execution
     - If the task throws an exception is always caught and will be passed to the caller through any/all of the the follow interfaces
       - via the callback `callback(e)` set with `onTaskError()` 
       - `waitAll()`
       - `waitAllSettled()`
        See each section for details on timing.
     - Returns void. 
  - `addEnd()`
     - A guarantee by the caller that no more tasks will be added with `addTask(...)`.  See `onEmpty(...)` for more details.
  - `getWorkingCount()`
     - Returns the number of currently working tasks.
  - `getWaitingCount()`
     - Returns the number of currently waiting, yet to be executed, tasks.
  - `getFinishedCount()`
     - Returns the number of currently waiting, yet to be executed, tasks.
  - `onTaskEnd(callback)`
     - The provided callback will be called with the (await denuded) result of each task as argument, except in case of exceptions. See `onTaskError` for handling exceptions.
  - `onTaskError(callback)`
     - The provided callback will be called for each task which throws an exception, with that exception as the callback argument.  
     - When the `onTaskError` callback is NOT set, the error WILL be propogated 
  - `onEmpty(callback)`
     - Provide a callback `callback` to be called when the tasks are all complete.
     - A necessary condition to invoke `callback` is that `addEnd()` has been called. `addEnd()` is a guarantee that no more tasks will be added with `addTask(...)`. The callback set with `onEmpty` will never be invoked until after `addEnd()` has been called, even if there are no working or waiting tasks left.
     - This provides an alternative to using `async waitAll()`/`async waitAllSettled()`, while not requiring the contructor parameter `useWaitAll` be set to `true`, so there is no risk of memory over-use.  
  - `async waitAll()`/`async waitAllSettled()`
     - can only be used when the contructor parameter `useWaitAll` was `true`, which enables an internal queue which will store and keep every task added, even after the task has finished working.
     - CAUTION: using the internal queue will result in ever increasing memory usage.  If that is a problem, two alternatives are:
        - use callbacks via `onTaskEnd`, `onTaskError`, and `onEmpty`.
        - use the asynchronous iterator paradigm provided with `AsyncIterTaskScheduler`.
     - performs respectively `Promise.all(...)`/`Promise.allSettled(...)` on the internal queue of all tasks, and returns that result.
     - `waitAll` doesn't catch exceptions, whereas `waitAllSettled` catches them to permit the other tasks to finish.

## `AsyncIterTaskScheduler` API


## `Semaphore` 
  - A utlity semaphore class 
     - `const {Semaphore}=require('task-scheduler');`
  - constructor `Semaphore(initCount)`
     - `initCount` is the initial semaphore count.
  - `async wait()` 
     - returns void when semphore count becomes > 0, or immediately if it is already > 0.
     - The semaphore count will be decremented by 1 on return. 
  - `signal()` adds 1 to the semaphore count. 

