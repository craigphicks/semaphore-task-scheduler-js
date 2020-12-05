'use strict';
//const { clearTimeout } = require('timers');

// const AsyncFunction = (async () => {}).constructor;
// const GeneratorFunction = (function* () {}).constructor;

// const isAsyncFunction = value => value instanceof AsyncFunction;
// const isGeneratorFunction = value => value instanceof GeneratorFunction;

// isAsyncFunction(async () => {}); // true
// isGeneratorFunction(function* () {}); // true

// const isAsync = myFunction[Symbol.toStringTag] === "AsyncFunction";

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

class TaskScheduler{
  constructor(initCount,useWaitAll=false){
    this._sem=new Semaphore(initCount);
    if (useWaitAll)
      this._taskq=[];
    this._numAdded=0;
    this._numFinished=0;
    this._onEmptyCallback=null;
    this._onTaskEndCallback=null;
    this._onTaskErrorCallback=null;
    this._anyError_pr=TaskScheduler._makepr();
    this._endFlag=false;
    //this._end_pr=TaskScheduler._makepr();  NOTUSED
    this._empty_pr=TaskScheduler._makepr();
  }
  static _makepr(){let pr={};pr.promise=new Promise(r=>pr.resolve=r); return pr;}
  addTask(func,...args){
    let p=(async()=>{
      await this._sem.wait();
      try {
        let result= await func(...args);
        if (this._onTaskEndCallback)
          this._onTaskEndCallback(result);
        return result;
      } catch(e) {
        this._anyError_pr.resolve();
        if (this._onTaskErrorCallback)
          this._onTaskErrorCallback(e);
        throw e;
      } finally {
        this._sem.signal();
        this._numFinished++;
        if (this._endFlag 
          && this.getWaitingCount()==0 && this.getWorkingCount()==0){
          if (this._onEmptyCallback)
            this._onEmptyCallback();
          this._empty_pr.resolve();
        }
      }
    })();
    this._numAdded++;
    // eslint-disable-next-line no-unused-vars
    p.catch((e)=>{});// unhandledRejection-defuse, without this, boom!
    if (this._taskq) 
      this._taskq.push(p);// defused  
    return p;
  }
  addEnd(){
    this._endFlag=true;
    // this section required if addEnd() is called after all task have already finished.
    // c.f. addTask() similar code.
    if (this.getWaitingCount()==0 && this.getWorkingCount()==0){
      if (this._onEmptyCallback)
        this._onEmptyCallback();
      this._empty_pr.resolve();
    }

    //this._end_pr.resolve(); NOT USED FOR WAITING
  }
  // Caution: If awaitAll is called before all the tasks 
  //   have been added, then it may return before all the 
  //   tasks have finished.
  getWorkingCount(){return this._numAdded-this._sem.getWaitingCount()-this._numFinished;}
  getWaitingCount(){return this._sem.getWaitingCount();}
  getFinishedCount(){return this._numFinished;}
  onEmpty(callback){this._onEmptyCallback=callback;}
  onTaskEnd(callback){this._onTaskEndCallback=callback;}
  onTaskError(callback){this._onTaskErrorCallback=callback;}

  static _waiterrmsg(){ return 'TaskScheduler arg useWaitAll=true ' 
   + 'is prerequisite for waitAll()/waitAllSettled() usage.';
  }
  async waitAll(){
    if (!this._taskq) throw new Error(TaskScheduler._waiterrmsg());
    await Promise.race([
      this._empty_pr.promise,// no more tasks will be completed
      this._anyError_pr // to mimic Promise.all, return on first error
    ]);
    // if there was a rejected promise, a corresponding rejected
    //   promise will also be in this._taskq
    return await Promise.all(this._taskq);
  }
  async waitAllSettled(){
    if (!this._taskq) throw new Error(TaskScheduler._waiterrmsg());
    await this._empty_pr.promise;// no more tasks will be completed
    return await Promise.allSettled(this._taskq);
  }
}


module.exports.TaskScheduler=TaskScheduler;
//module.exports.test_TaskScheduler=test_TaskScheduler;
