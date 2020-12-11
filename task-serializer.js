'use strict';
class Semaphore{
  constructor(concurrentLimit=0){
    this._concurrentLimit=concurrentLimit;
    this._count=concurrentLimit;
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
  getconcurrentLimit(){return this._concurrentLimit;}
  getWaitingCount(){return this._resolveq.length;}
}

class TaskSerializer{
  constructor(concurrentLimit){
    this._usingConcurrentLimit=(concurrentLimit>0);
    this._sem=new Semaphore(
      this._usingConcurrentLimit?concurrentLimit:Number.MAX_SAFE_INTEGER);
    this._numAdded=0;
    this._numFinished=0;
    this._onEmptyCallback=null;
    this._onTaskEndCallback=null;
    this._onTaskErrorCallback=null;
    this._endFlag=false;
  }
  static _makepr(){
    let pr={};pr.promise=new Promise(r=>pr.resolve=r); return pr;
  }
  addTask(func,...args){
    let p=(async()=>{
      await this._sem.wait();
      try {
        let result;
        if (func instanceof Function)
          result = await func(...args);
        else if (func instanceof Promise){
          if (this._usingConcurrentLimit)
            throw new Error(
              'addTask, illogical to add promise when concurrent limit in use');
          result=func; // OK
        }
        if (this._onTaskEndCallback)
          this._onTaskEndCallback(result);
        return result;
      } catch(e) {
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
    // this section required in case addEnd() is called after all 
    // tasks have already finished, c.f. addTask() similar code.
    if (this.getWaitingCount()==0 && this.getWorkingCount()==0){
      if (this._onEmptyCallback)
        this._onEmptyCallback();
    }
  }
  getWorkingCount(){return this._numAdded-this._sem.getWaitingCount()-this._numFinished;}
  getWaitingCount(){return this._sem.getWaitingCount();}
  getFinishedCount(){return this._numFinished;}
  onEmpty(callback){this._onEmptyCallback=callback;}
  onTaskEnd(callback){this._onTaskEndCallback=callback;}
  onTaskError(callback){this._onTaskErrorCallback=callback;}
}
module.exports.TaskSerializer=TaskSerializer;
//module.exports.test_TaskSerializer=test_TaskSerializer;
