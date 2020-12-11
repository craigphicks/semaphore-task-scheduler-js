'use strict';

const {TaskSerializer}=require('./task-serializer.js');

class AsyncIter {
  constructor(initCount){
    this._sts=new TaskSerializer(initCount);
    this._q=[];
    this._qe=[];
    this._nextpr={};
    this._reset_nextpr();
    this._emptyFlag=false;
    this._sts.onTaskEnd(((retval)=>{
      this._q.push(retval);
      this._nextpr.resolve();
    }).bind(this));
    this._sts.onTaskError(((e)=>{
      this._qe.push(e);
      this._nextpr.resolve();
    }).bind(this));
    this._sts.onEmpty((()=>{
      this._emptyFlag=true;
      this._nextpr.resolve();
    }).bind(this));
    //this._lnk_reset_nextpr=this._reset_nextpr.bind(this);
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
        for (let iter=0;; iter++){
          // eslint-disable-next-line no-constant-condition
          if (that._qe.length) // errors have priority
            throw that._qe.splice(0,1)[0];
          if (that._q.length) // "normal" return
            return {done:false,value:that._q.splice(0,1)};
          // empty flag may be set before q,qe are drained so check this last
          // "empty" only means the sts member is empty, not ourself.
          if (that._emptyFlag)
            return {done:true};
          // we should wait here on promise until new data is ready
          if (iter>0)
            throw new Error(`asyncIterator.next, unexpected error iter==${iter}`);
          await that._nextpr.promise;
          that._reset_nextpr();  
        }
      }
    };
  }
}

module.exports.AsyncIter=AsyncIter;

