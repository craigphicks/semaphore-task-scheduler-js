/* eslint-disable no-unused-vars */
'use strict';

const {TaskSerializer}=require('./task-serializer.js');
class Callbacks{
  constructor({concurrentTaskLimit=0}={}){
    if (Object.keys(arguments).includes('0'))
      concurrentTaskLimit=arguments['0'];
    this._ts=new TaskSerializer(concurrentTaskLimit);
  }
  onTaskResolved(cb){this._ts.onTaskResolved(cb);}
  onTaskRejected(cb){this._ts.onTaskRejected(cb);}
  onEmpty(cb){this._ts.onEmpty(cb);}
  addTask(func,...args){this._ts.addTask(func,...args);}
  addEnd(){this._ts.addEnd();}
  // informationals
  getCountWaiting(){return this._ts.getWaitingCount();}
  getCountWorking(){return this._ts.getWorkingCount();}
  // Callbacks has no read buffering, 
  // so the following are monotonically increasing totals
  getCountResolvedTotal(){return this._ts.getResolvedCount();}
  getCountRejectedTotal(){return this._ts.getRejectedCount();}
  getCountFinishedTotal(){return this._ts.getFinishedCount();}
}
module.exports.Callbacks=Callbacks;
