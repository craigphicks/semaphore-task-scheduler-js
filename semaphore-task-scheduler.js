'use strict';
//const { clearTimeout } = require('timers');

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
  constructor(initCount,useWaitAll=false){
    this._sem=new Semaphore(initCount);
    if (useWaitAll)
      this._taskq=[];
    this._numAdded=0;
    this._numFinished=0;
    this._onEmptyCallback=null;
    this._onTaskEndCallback=null;
    this._onTaskErrorCallback=null;
  }
  addTask(func,...args){
    let p=(async()=>{
      await this._sem.wait();
      try {
        let result=await func(...args);
        if (this._onTaskEndCallback)
          this._onTaskEndCallback(result);
        return result;
      } catch(e) {
        if (this._onTaskErrorCallback)
          this._onTaskErrorCallback(e);
        else
          throw e;
      } finally {
        this._sem.signal();
        this._numFinished++;
        if (this._onEmptyCallback && this.getWaitingCount()==0 && this.getWorkingCount()==0){
          this._onEmptyCallback();
        }
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
  onEmpty(callback){this._onEmptyCallback=callback;}
  onTaskEnd(callback){this._onTaskEndCallback=callback;}
  onTaskError(callback){this._onTaskErrorCallback=callback;}

  static _waiterrmsg(){ return 'SemaphoreTaskScheduler arg useWaitAll=true ' 
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




module.exports.SemaphoreTaskScheduler=SemaphoreTaskScheduler;
//module.exports.test_SemaphoreTaskScheduler=test_SemaphoreTaskScheduler;
