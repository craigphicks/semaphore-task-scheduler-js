'use_strict';
const {SemaphoreTaskScheduler}=require('./semaphore-task-scheduler.js');
const assert=require('assert');


function makePr(){
  let pr={};
  pr.promise=new Promise((r)=>{
    pr.resolve=()=>{
      console.log('makePr object resolving');
      r();
    };
  });
  return pr;
}


async function test_SemaphoreTaskScheduler_phase1(){
  //console.log(process.version);
  let sts=new SemaphoreTaskScheduler(2,true);
  let snooze=(t)=>{return new Promise((r)=>{setTimeout(r,t);});};
  let logStatus=async()=>{
    await snooze(0);
    console.log(
      `working=${sts.getWorkingCount()},`
      +`waiting=${sts.getWaitingCount()},`
      +`finished=${sts.getFinishedCount()}`
    );
  };
  let ftask=async(n,qw1,qwAll=null)=>{
    console.log(`ftask ${n} after start`);
    if (!qwAll)
      await qw1;
    else {
      await Promise.race([
        qwAll.then(()=>{
          console.log(`aborting task ${n}`);
          throw new Error(`aborting task ${n}`);
        }),
        qw1
      ]); 
    }
    console.log(`ftask ${n} before end`);
    return;
  };
  let myTaskResolves=[];
  let myResolve=async(n)=>{
    console.log(`signal ftask ${n} to end`);
    myTaskResolves[n]();
    snooze(0);
  };
  let myWaitableReset=()=>{
    myTaskResolves=[];
  };
  let myWaitable=()=>{
    let pr=makePr();
    myTaskResolves.push(pr.resolve);
    return pr.promise;
  };
  let assertStatus=async(working,waiting,finished)=>{
    snooze(0);
    let expected={working,waiting,finished};
    let actual={
      working:sts.getWorkingCount(),
      waiting:sts.getWaitingCount(),
      finished:sts.getFinishedCount()
    };
    assert.deepStrictEqual(actual,expected);
  };
  assertStatus(0,0,0);

  sts.addTask(ftask, 0, myWaitable());
  await logStatus();
  assertStatus(1,0,0);

  sts.addTask(ftask, 1, myWaitable());
  await logStatus();
  assertStatus(2,0,0);

  sts.addTask(ftask, 2, myWaitable());
  await logStatus();
  assertStatus(2,1,0);

  await myResolve(1);
  await logStatus();
  assertStatus(2,0,1);

  await myResolve(2);
  await logStatus();
  assertStatus(1,0,2);

  await myResolve(0);
  console.log(`expect empty`);
  await logStatus();
  assertStatus(0,0,3);

  sts.addTask(ftask, 3, myWaitable());
  await logStatus();
  assertStatus(1,0,3);

  sts.addTask(ftask, 4, myWaitable());
  await logStatus();
  assertStatus(2,0,3);

  sts.addTask(ftask, 5, myWaitable());
  await logStatus();
  assertStatus(2,1,3);

  setTimeout(async()=>{
    await myResolve(4);
    await logStatus();
    assertStatus(2,0,4);

    await myResolve(5);
    await logStatus();
    assertStatus(1,0,5);

    await myResolve(3);
    await logStatus();
    assertStatus(0,0,6);
  },0);
  await sts.waitAll();
  console.log(`awaitAll returned`);
  await logStatus();
  assertStatus(0,0,6);

  console.log('==== PART2 =====');
  myWaitableReset();
  sts=new SemaphoreTaskScheduler(2,true);
  console.log('test with task exceptions');
  let abortAllTasks=makePr();
  sts.addTask(ftask, 0, myWaitable(), abortAllTasks.promise);
  sts.addTask(ftask, 1, myWaitable(), abortAllTasks.promise);
  sts.addTask(ftask, 2, myWaitable(), abortAllTasks.promise);
  await logStatus();
  assertStatus(2,1,0);
  console.log('trigger early abort abortAllTasks.resolve()');
  setTimeout(abortAllTasks.resolve,1);
  await sts.waitAllSettled();
  console.log(`expect empty`);
  await logStatus();
  assertStatus(0,0,3);

  console.log('==== PART3 =====');
  myWaitableReset();
  sts=new SemaphoreTaskScheduler(2,false);
  let empty=makePr();
  sts.onEmpty(()=>{
    console.log('onEmpty');
    empty.resolve();
  });
  await Promise.all([
    empty.promise.then(()=>{
      console.log('empty.promise resolved');
    }),
    (async()=>{
      sts.addTask(ftask, 0, myWaitable());
      sts.addTask(ftask, 1, myWaitable());
      sts.addTask(ftask, 2, myWaitable());
      await logStatus();
      await myResolve(1);
      await logStatus();
      await myResolve(2);
      await logStatus();
      await myResolve(0);
      await logStatus();
    })()
  ]);
  assertStatus(0,0,3);
}

async function test_SemaphoreTaskScheduler_phase2(){
  let snooze=(t)=>{return new Promise((r)=>{setTimeout(r,t);});};
  let emptyProm=makePr();
  let [onTaskEndCalled,onTaskErrorCalled,onEmptyCalled]=[0,0,0];
  let onTaskEndCb=(ret)=>{onTaskEndCalled++;console.log(`onTaskEnd ${ret}`);};
  let onTaskErrorCb=(e)=>{onTaskErrorCalled++;console.log(`onTaskEnd ${e.message}`);};
  let onEmptyCb=()=>{onEmptyCalled++;console.log(`onEmpty`);emptyProm.resolve();};
  let sts=new SemaphoreTaskScheduler(2);
  sts.onTaskEnd(onTaskEndCb);
  sts.onTaskError(onTaskErrorCb);
  sts.onEmpty(onEmptyCb);
  let task=async(idstr,isError,waitable)=>{
    await waitable;
    snooze(20);
    if (!isError)
      return idstr;
    else 
      throw new Error(idstr);
  };

  let taskTrigs=[];
  for (let i=0;i<6;i++){
    let pr=makePr();
    taskTrigs.push(pr.resolve);
    sts.addTask(task,i,i%3,pr.promise);
  }
  setTimeout(()=>{
    for (let i=0;i<6;i++){
      taskTrigs[i]();
      snooze(0);
    }
  },0);
  await emptyProm.promise;
  assert.strictEqual(onTaskEndCalled,2);
  assert.strictEqual(onTaskErrorCalled,4);
  assert.strictEqual(onEmptyCalled,1);
  console.log('phase2 success');
}

async function test_SemaphoreTaskScheduler(){
  await test_SemaphoreTaskScheduler_phase1();
  await test_SemaphoreTaskScheduler_phase2();
}


test_SemaphoreTaskScheduler()
  .then(()=>{
    console.log('test_SemaphoreTaskScheduler.then ');
    process.exitCode=0;

  })
  .catch((e)=>{
    console.error('test_SemaphoreTaskScheduler.catch '+ e.message);
    process.exitCode=1;
  });

process.on('beforeExit',async()=>{
  if (typeof process.exitCode=='undefined'){
    console.error('unexpected "beforeExit" event');
    process.exit(2);
  } else 
    process.exit(process.exitCode);
});

