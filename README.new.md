copyright 2020 craigphicks ISC license

TaskSerializer
---

# Outline
The `TaskSerializer` JS modules offers several classes for serialing tasks - adding the tasks/promise immediately as they appear, and then being served the results in orderly way, e.g., a control loop, from the pipeline.
Optionally, the number of concurrently running tasks are limited to a user parameter. In that special case, only uncalled functions (and their args) may be added, and function will be executed when a space is available - trying to add promises will throw an Error.
Errors are prioritized to be presented before the results on normally returning tasks.  (Except for `WaitAll.waitAllSettled`.)
All Errors are "defused", so that they don't throw unhandled exceptions while in the pipeline.  
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

# Note on shared demo functions

To make the examples more readable, some shared demo functions are used, and those shared functions are listed at the end of the examples (so as not to distract.)  One of those functions is the async function `producer(ts)`, which inputs the tasks calling `addTask(...)`, staggered over time, with some of those tasks resulting in `Errors` being thrown, and then ends the input calling `addEnd()`.   
All the example code is availalable in the `example-usages` subdirectory of the installed node module, e.g., `node_modules/task-serializer/example-usages`.

## `AsyncIter` usage example

## `NextSymbol` usage example

## `WaitAll` usage example

## `Callbacks` usage example

## `demo-lib.js`

# APIs

## API shared by all classes

## `AsyncIter` only API

## `NextSymbol` only API

## `WaitAll` only API

## `Callbacks` only API



