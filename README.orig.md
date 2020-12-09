copyright 2020 craigphicks ISC license

# Outline
User friendly interface(s) for scheduling multiple tasks while only allowing a certain number of tasks to enter at the same time. 

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

# APIs

## `TaskScheduler` API
  - `const {TaskScheduler}=require('task-scheduler')`
  - constructor `TaskScheduler(initCount,useWaitAll)`
    - `initCount` : integer 
      - maximum number of tasks allowed to execute simultaneously. No default value.
    - `useWaitAll` : boolean 
      - if `true` then each added task will be stored in a queue for the sole purpose of enabling the `waitAll` or `waitAllSettled` functions. Default is `false`.  See `waitAll` or `waitAllSettled` for more details.
      - Caution: `true` could result in excessive memory usage.  
      - Returns an instance of `TaskScheduler`
  - `addTask(asyncFunc, ...args)`
    - `asyncFunc` is an asynchronous function to be executed when the count constraint permits.
    - `...args` are arbitray arguments to be passed to `asyncFunc` on execution
    - If the task throws an exception is always caught and will be passed to the caller through any/all of the the follow interfaces:
      - via `catch`/`try` applied to the promise returned from `addTask`
      - via the callback set with `onTaskError()` 
      - `waitAll()`
      - `waitAllSettled()`
    - Any task exception is "defused* before forwarding - e.g., if the return value of `addTask` is ignored, that will never result in an unhandled exception. 
    - Returns a promise that resolves/rejects to the tasks result/thrown-value.
  - `addEnd()`
    - A guarantee by the caller that no more tasks will be added with `addTask(...)`.  Trying to call `addTask` again after calling `addEnd` will result in an exception.See `onEmpty(...)` for more details.
  - `getWorkingCount()`
    - Returns the number of currently working tasks.
  - `getWaitingCount()`
    - Returns the number of currently waiting, yet to be executed, tasks.
  - `getFinishedCount()`
    - Returns the number of currently waiting, yet to be executed, tasks.
  - `onTaskEnd(callback)`
    - The provided callback will be called on each task completion, with the (await denuded) result of each task as callback argument, except in case of exceptions. See `onTaskError` for handling exceptions.
    - Usage constraints:
      - Not required. (`addTask` returned promise, `WaitAll*` can be used instead.) 
      - When used, must be set before first `addTask` call.
      - Callback exceptions will become unhandled exceptions.
      - Callbacks may be async or sync. The calling side does not `await` them.  Sync callbacks should not block.  
  - `onTaskError(callback)`
    - The provided callback will be called for each task which throws an exception, with that exception as the callback argument.
    - Usage constraints: basically the same as those for `onTaskEnd`  
  - `onEmpty(callback)`
    - Provide a callback `callback` to be called when the tasks are all complete.
    - A necessary condition to invoke `callback` is that `addEnd()` has been called. `addEnd()` is a guarantee that no more tasks will be added with `addTask(...)`. The callback set with `onEmpty` will never be invoked until after `addEnd()` has been called, even if there are no working or waiting tasks left.
    - This provides an alternative to using `async waitAll()`/`async waitAllSettled()`, while not requiring the constructor parameter `useWaitAll` be set to `true`, so there is no risk of memory over-use.  
    - Usage constraints: basically the same as those for `onTaskEnd`  
  - `async waitAll()`/`async waitAllSettled()`
    - can only be used when the constructor parameter `useWaitAll` was `true`, which enables an internal queue which will store and keep every task added, even after the task has finished working.
    - CAUTION: using the internal queue will result in ever increasing memory usage.  If that is a problem then alternatives are:
      - use the promises returned by `addTask`, and an `onEmpty` callback.
      - use callbacks via `onTaskEnd`, `onTaskError`, and `onEmpty`.
      - use the asynchronous iterator paradigm provided with the seperate `AsyncIter` class in this same package.
    - Constraints on usage:
      - Neither required, nor mutually exclusive of other interface methods.
      - Unlike the callback alterternatives, `waitAll/waitAllSettled` are not required to be set before the first call to `addTask`, because the internal queue provides a buffer.
      - `waitAll` is not suitable when processing must continue after the first error.  In that case use `waitAllSettled`.
      - Both methods use memory size proportional to total number of tasks.
      - Behaviour:
      - `await waitAll` will return the first task error (including from among those thrown before `waitAll` was called), or will return the array of all task results when all tasks have completed.  The returned result is equivalent to putting all the promises returned from `addTask` into an array, and passing that array to `Promise.all`.  However, `waitAll` can be called before all the tasks have completed. 
      - `await waitAllSettled` will return when all the tasks have completed. The returned result is equivalent to putting all the promises returned from `addTask` into an array, and passing that array to `Promise.allSettled`.  However, `waitAllSettled` can be called before all the tasks have completed.

## `AsyncIter` API
  - `const {AsyncIter}=require('task-scheduler')`
  - `new AsyncIter(initCount)`
    - `initCount` : integer 
      - maximum number of tasks allowed to execute simultaneously. No default value.
  - `instance.addTask(asyncFunc, ...args):undefined`
    - `asyncFunc` is an asynchronous function to be executed when the count constraint permits.
    - `...args` are arbitray arguments to be passed to `asyncFunc` on execution
    - ~If the task throws an exception is always caught and will be passed to the caller through 
    - ~Any task exception is "defused* before forwarding - e.g., if the return value of `next()` is ignored, that will never result in an unhandled exception. 
    - Returns undefined.
  - `instance.addEnd()`
    - A guarantee by the caller that no more tasks will be added with `addTask(...)`.  Trying to call `addTask` again after calling `addEnd` will result in an exception.
  - explicit `instance.next()` or implicit `for await (iter of instance)`

## `Semaphore` 
  - `const {Semaphore}=require('task-scheduler');`
    - A utlity semaphore class 
  - constructor `Semaphore(initCount)`
     - `initCount` is the initial semaphore count.
  - `async wait()` 
     - returns void when semphore count becomes > 0, or immediately if it is already > 0.
     - The semaphore count will be decremented by 1 on return. 
  - `signal()` adds 1 to the semaphore count. 

