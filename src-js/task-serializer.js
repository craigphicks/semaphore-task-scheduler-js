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
    if (this._usingConcurrentLimit)
      this._sem=new Semaphore(concurrentLimit);
    this._numAdded=0;
    //this._numFinished=0;
    // each finished with be either resolved or rejected
    this._numResolved=0;
    this._numRejected=0;
    this._onEmptyCallback=null;
    this._onTaskResolvedCallback=null;
    this._onTaskRejectedCallback=null;
    this._endFlag=false;
  }
  static _makepr(){
    let pr={};pr.promise=new Promise(r=>pr.resolve=r); return pr;
  }
  addTask(func,...args){
    let p=(async()=>{
      if (this._usingConcurrentLimit)
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
        this._numResolved++;
        if (this._onTaskResolvedCallback)
          this._onTaskResolvedCallback(result);
        return result;
      } catch(e) {
        this._numRejected++;
        if (this._onTaskRejectedCallback)
          this._onTaskRejectedCallback(e);
        throw e;
      } finally {
        if (this._usingConcurrentLimit)
          this._sem.signal();
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
  getWorkingCount(){
    return this._numAdded-this.getFinishedCount()-this.getWaitingCount();
  }
  getWaitingCount(){
    return this._usingConcurrentLimit?this._sem.getWaitingCount():0;
  }
  getFinishedCount(){
    return this.getResolvedCount()+this.getRejectedCount();
  }
  getResolvedCount(){return this._numResolved;}
  getRejectedCount(){return this._numRejected;}
  onEmpty(callback){this._onEmptyCallback=callback;}
  onTaskResolved(callback){this._onTaskResolvedCallback=callback;}
  onTaskRejected(callback){this._onTaskRejectedCallback=callback;}
}
module.exports.TaskSerializer=TaskSerializer;
//module.exports.test_TaskSerializer=test_TaskSerializer;
