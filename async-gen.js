'use strict';


const {SemaphoreTaskScheduler}=require('./semaphore-task-scheduler.js');

class AsyncIterTaskScheduler {
  constructor(initCount){
    this._sts=SemaphoreTaskScheduler(initCount);
    this._q=[];
    this._qe=[];
    this._nextpr={};
    this._reset_nextpr();
    this._sts.onTaskEnd((retval)=>{
      this._q.push(retval);
      this._nextpr.resolve();
    });
    this._sts.onTaskError((e)=>{
      this._qe.push(e);
      this._nextpr.resolve();
    });
    this._sts.onEmpty(()=>{
      this._emptyFlag=true;
      this._nextpr.resolve();
    });
  }
  _reset_nextpr(){
    this._nextpr={};
    this._nextpr.promise=new Promise((r)=>{this._nextpr.resolve=r;});
  }
  addTask(func,...args){
    this._sts.addTask(func,...args);
  }
  addEnd(){
    this._sts.addEnd();
  }
  [Symbol.asyncIterator](){
    let that=this;
    return {
      async next(){
        // eslint-disable-next-line no-constant-condition
        for (let i=0;; i++){
          if (that._qe.length) // errors have priority
            return Promise.reject({done:false,value:that._qe.unshift()});
          if (that._q.length) // "normal" return
            return Promise.resolve({done:false,value:that._q.unshift()});
          if (that._emptyFlag) // empty flag may be set before q,qe are drained so check this last
            return Promise.resolve({done:true});
          // should NEVER reach here on second iteration
          if (i>1) 
            return {done:true, value:Promise.reject(Error('unexpected internal error: i>1)'))};
          await that._nextpr.promise;
          that._resetNextPr();
        }
      }
    };
  }
}

// function createAsyncIterable(initCount){
//   let sts = SemaphoreTaskScheduler(initCount);
//   sts.onTaskEnd((ret)=>)
//   return {
//     [Symbol.asyncIterator]() {
//       return {
//         state: {
//           sts:sts,
//         },
//         next() {
//           if (this.i < 3) {
//             return Promise.resolve({ value: this.i++, done: false });
//           }
  
//           return Promise.resolve({ done: true });
//         }
//       };
//     }
//   };
// }

// const asyncIterable = {
//   [Symbol.asyncIterator]() {
//     return {
//       i: 0,
//       next() {
//         if (this.i < 3) {
//           return Promise.resolve({ value: this.i++, done: false });
//         }

//         return Promise.resolve({ done: true });
//       }
//     };
//   }
// };