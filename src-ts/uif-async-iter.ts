import type {Promolve} from './lib'
import {makePromolve} from './lib'
import {Common,CommonCtorParams} from './uif-common'

class AsyncIter extends Common{
  _q:any[];
  _qe:any[];
  _nextpr:Promolve;
  _emptyFlag:boolean;
  _asyncIterable // fortunately it deduces the type automatically

  constructor(...args:CommonCtorParams){
    super(...args)
    this._q=[];
    this._qe=[];
    this._nextpr=makePromolve();
    this._emptyFlag=false;
    this._ts.onTaskResolved(((retval:any)=>{
      this._q.push(retval);
      this._nextpr.resolve();
    }).bind(this));
    this._ts.onTaskRejected(((e:any)=>{
      this._qe.push(e);
      this._nextpr.resolve();
    }).bind(this));
    this._ts.onEmpty((()=>{
      this._emptyFlag=true;
      this._nextpr.resolve();
    }).bind(this));
    this._asyncIterable=this._createAsyncIterable();
  }
  _reset_nextpr(){
    this._nextpr=makePromolve();
  }
  _createAsyncIterable(){
    let that=this;
    return {
      async next(){
        for (let iter=0;; iter++){
          if (that._qe.length) // errors have priority
            throw that._qe.splice(0,1)[0];
          if (that._q.length) // "normal" return
            return {done:false,value:that._q.splice(0,1)};
          // empty flag may be set before q,qe are drained so check this last
          // "empty" only means the sts member is empty, not ourself.
          if (that._emptyFlag)
            return {done:true};
          if (iter>0)
            throw new Error(`asyncIterator.next, unexpected error iter==${iter}`);
          // wait here on promise (only once) until new data is ready
          await that._nextpr.promise;
          that._nextpr=makePromolve();
        }
      }
    };
  }
  [Symbol.asyncIterator](){return this._asyncIterable; }
  next(){return this._asyncIterable.next();}
  // informationals
  // getCountWaiting(){return this._ts.getWaitingCount();}
  // getCountWorking(){return this._ts.getWorkingCount();}
  getCountResolvedNotRead(){return this._q.length;}
  getCountRejectedNotRead(){return this._qe.length;}
  getCountFinishedNotRead(){return this._q.length+this._qe.length;}
  // the following are monotonically increasing totals, 
  // getCountResolvedTotal(){return this._ts.getResolvedCount();}
  // getCountRejectedTotal(){return this._ts.getRejectedCount();}
  // getCountFinishedTotal(){return this._ts.getFinishedCount();}
}

export {AsyncIter}

