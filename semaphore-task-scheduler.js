'use strict';
const assert=require('assert');

class Semaphore{
  constructor(initCount=0){
    this._initCount=initCount;
    this._count=initCount;
    this._resolveq=[];
  }
  async wait(){
    if (this._count>0){
      this._count--;
      return;
    } 
    let res;
    let p = new Promise((r)=>{res=r;});
    this._resolveq.push(res);
    return p;
  }
  signal(){
    if (this._resolveq.length)
      (this._resolveq.splice(0,1)[0])(); // resolve it 
    else 
      this._count++;
  }
  getCount(){return this._count;}
  getInitCount(){return this._initCount;}
  getWaitingCount(){return this._resolveq.length;}
}

class SemaphoreTaskScheduler{
  constructor(initCount,queueTasks=false){
    this._sem=new Semaphore(initCount);
    if (queueTasks)
      this._taskq=[];
    this._numAdded=0;
    this._numFinished=0;
  }
  addTask(func,...args){
    let p=(async()=>{
      await this._sem.wait();
      try {
        return await func(...args);
      } finally {
        this._sem.signal();
        this._numFinished++;
      }
    })();
    this._numAdded++;
    if (this._taskq)
      this._taskq.push(p);
    return p;
  }
  // Caution: If awaitAll is called before all the tasks 
  //   have been added, then it may return before all the 
  //   tasks have finished.
  getWorkingCount(){return this._numAdded-this._sem.getWaitingCount()-this._numFinished;}
  getWaitingCount(){return this._sem.getWaitingCount();}
  getFinishedCount(){return this._numFinished;}

  static _waiterrmsg(){ return 'SemaphoreTaskScheduler arg queueTasks=true ' 
   + 'is prerequisite for waitAll()/waitAllSettled() usage.';
  }
  async waitAll(){
    if (!this._taskq) throw new Error(this._waiterrmsg());
    return await Promise.all(this._taskq);
  }
  async waitAllSettled(){
    if (!this._taskq) throw new Error(this._waiterrmsg());
    return await Promise.allSettled(this._taskq);
  }
}



async function test_SemaphoreTaskScheduler(){
  console.log(process.version);
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
  let makePr=()=>{
    let pr={};
    pr.promise=new Promise((r)=>{
      pr.resolve=()=>{
        console.log('makePr object resolving');
        r();
      };
    });
    return pr;
  };
  let myTaskResolves=[];
  let myResolve=async(n)=>{
    console.log(`signal ftask ${n} to end`);
    myTaskResolves[n]();
    snooze(0);
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
}

module.exports.SemaphoreTaskScheduler=SemaphoreTaskScheduler;
module.exports.test_SemaphoreTaskScheduler=test_SemaphoreTaskScheduler;
