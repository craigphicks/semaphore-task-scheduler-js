'use_strict';
import {TaskSerializer} from '../dist/task-serializer.js';
import assert=require('assert');


function makePr():{promise:Promise<void>,resolve:()=>void}{
  let pr={};
  // @ts-expect-error
  pr.promise=new Promise(r=>pr.resolve=r);
  // @ts-expect-error
  return pr;
}


async function test_TaskSerializer_phase1(){
  console.log("---- test_TaskSerializer_phase1 ----");
  let sts=new TaskSerializer(2);
  let end_pr=TaskSerializer._makepr();
  sts.onEmpty(()=>{
    end_pr.resolve();
  });
  let snooze=(t:number)=>{return new Promise((r)=>{setTimeout(r,t);});};
  let logStatus=async()=>{
    await snooze(0);
    console.log(
      `working=${sts.getWorkingCount()},`
      +`waiting=${sts.getWaitingCount()},`
      +`finished=${sts.getFinishedCount()}`
    );
  };
  let ftask=async(n:number,
      qw1:Promise<void>,
      qwAll:Promise<void>|null=null
    )=>{
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
  let myTaskResolves:(()=>void)[]=[];
  let myResolve=async(n:number)=>{
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
  let assertStatus=async(working:number,waiting:number,finished:number)=>{
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

  sts.addEnd();

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
  //await sts.waitAll();
  await end_pr.promise;
  console.log(`await end_pr.promise returned`);
  await logStatus();
  assertStatus(0,0,6);

  console.log('==== PART2 =====');
  myWaitableReset();
  sts=new TaskSerializer(2);
  end_pr=TaskSerializer._makepr();
  sts.onEmpty(()=>{
    end_pr.resolve();
  });

  console.log('test with task exceptions');
  let abortAllTasks=makePr();
  sts.addTask(ftask, 0, myWaitable(), abortAllTasks.promise);
  sts.addTask(ftask, 1, myWaitable(), abortAllTasks.promise);
  sts.addTask(ftask, 2, myWaitable(), abortAllTasks.promise);
  sts.addEnd();
  await logStatus();
  assertStatus(2,1,0);
  console.log('trigger early abort abortAllTasks.resolve()');
  setTimeout(abortAllTasks.resolve,1);
  await end_pr.promise;
  //await sts.waitAllSettled();
  console.log(`expect empty`);
  await logStatus();
  assertStatus(0,0,3);
  console.log(`notably, no unhandled rejections from the queue`);

  console.log('==== PART3 =====');
  myWaitableReset();
  sts=new TaskSerializer(2);
  let empty_pr=makePr();
  let emptyCallbackSuccess=false;
  sts.onEmpty(()=>{
    console.log('onEmpty');
    emptyCallbackSuccess=true;
    empty_pr.resolve();
  });
  sts.addTask(ftask, 0, myWaitable());
  sts.addTask(ftask, 1, myWaitable());
  sts.addTask(ftask, 2, myWaitable());
  await logStatus();
  await myResolve(1);
  await logStatus();
  sts.addEnd();
  await myResolve(2);
  await logStatus();
  await myResolve(0);
  await logStatus();
  await empty_pr.promise;
  assertStatus(0,0,3);
  assert.strictEqual(emptyCallbackSuccess,true,"emptyCallbackSuccess");
}

async function test_TaskSerializer_phase2(variant:number){
  console.log(`---- test_TaskSerializer_phase2 variant=${variant} ----`);
  let snooze=(t:number)=>{return new Promise((r)=>{setTimeout(r,t);});};
  let emptyProm=makePr();
  let [onTaskResolvedCalled,onTaskRejectedCalled,onEmptyCalled]=[0,0,0];
  let onTaskResolvedCb=(ret:any)=>{onTaskResolvedCalled++;console.log(`onTaskResolved ${ret}`);};
  let onTaskRejectedCb=(e:Error)=>{onTaskRejectedCalled++;console.log(`onTaskResolved ${e.message}`);};
  let onEmptyCb=()=>{onEmptyCalled++;console.log(`onEmpty`);emptyProm.resolve();};
  let sts=new TaskSerializer(2);
  sts.onTaskResolved(onTaskResolvedCb);
  sts.onTaskRejected(onTaskRejectedCb);
  sts.onEmpty(onEmptyCb);
  let task=async(idstr:string,isError:boolean,waitable:Promise<void>)=>{
    await waitable;
    await snooze(20);
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
  if (variant==0)
    sts.addEnd();
  taskTrigs.forEach(x=>x()); 
  if (variant==1)
    sts.addEnd();
  await emptyProm.promise;
  assert.strictEqual(onTaskResolvedCalled,2);
  assert.strictEqual(onTaskRejectedCalled,4);
  assert.strictEqual(onEmptyCalled,1);
  console.log('phase2 success');
}

async function test_TaskSerializer(){
  await test_TaskSerializer_phase1();
  await test_TaskSerializer_phase2(0);
  await test_TaskSerializer_phase2(1);
}


test_TaskSerializer()
  .then(()=>{
    console.log('test_TaskSerializer.then ');
    process.exitCode=0;
  })
  .catch((e)=>{
    console.error('test_TaskSerializer.catch '+ e.message);
    process.exitCode=1;
  });

process.on('beforeExit',async()=>{
  if (typeof process.exitCode=='undefined'){
    console.error('unexpected "beforeExit" event');
    process.exit(2);
  } else 
    process.exit(process.exitCode);
});


