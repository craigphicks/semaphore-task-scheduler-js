/* eslint-disable no-unused-vars */
'use strict';

const {TaskSerializer}=require('./task-serializer.js');
class Callbacks{
  constructor({concurrentLimit=0}={}){
    this._ts=new TaskSerializer(concurrentLimit);
  }
  onTaskResolved(cb){this._ts.onTaskResolved(cb);}
  onTaskRejected(cb){this._ts.onTaskRejected(cb);}
  onEmpty(cb){this._ts.onEmpty(cb);}
  addTask(func,...args){this._ts.addTask(func,...args);}
  addEnd(){this._ts.addEnd();}
  getWorkingCount(){return this._ts.getWorkingCount();}
  getWaitingCount(){return this._ts.getWaitingCount();}
  getFinishedCount(){return this._ts.getFinishedCount();}
}
module.exports.Callbacks=Callbacks;
