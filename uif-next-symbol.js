const {TaskSerializer}=require('./task-serializer.js');
class NextSymbol{
  constructor({
    concurrentTaskLimit=0,
  }={}){
    this._ts=new TaskSerializer(concurrentTaskLimit);
    this._result=TaskSerializer._makepr();
    this._error=TaskSerializer._makepr();
    this._qresults=[];
    this._qerrors=[];
    this._empty=TaskSerializer._makepr();
    this._ts.onTaskResolved((result)=>{
      this._qresults.push(result);
      this._result.resolve();
    });
    this._ts.onTaskRejected((error)=>{
      this._qerrors.push(error);
      this._error.resolve();
    });
    this._ts.onEmpty(()=>{
      this._empty.resolve();
    });
    this._symTaskResolved=Symbol('TaskResolved');
    this._symTaskRejected=Symbol('TaskRejected');
    this._symAllRead=Symbol('AllRead');
  }
  getTaskResolvedValue(){
    if (!this._qresults.length) 
      throw new Error('getTaskResolvedValue - not ready');
    if (this._qresults.length==1)
      this._result=TaskSerializer._makepr();
    return this._qresults.splice(0,1)[0];
  }
  getTaskRejectedValue(){
    if (!this._qerrors.length) 
      throw new Error('getTaskRejectedValue - not ready');
    if (this._qerrors.length==1) 
      this._error=TaskSerializer._makepr();
    return this._qerrors.splice(0,1)[0];
  }
  addTask(func,...args){
    this._ts.addTask(func,...args);
  }
  addEnd(){
    this._ts.addEnd();
  }
  symbolAllRead(){return this._symAllRead;}
  symbolTaskResolved(){return this._symTaskResolved;}
  symbolTaskRejected(){return this._symTaskRejected;}
  nextSymbol(){// this promise can be safely abandoned
    // Note: the order of promises ensures that this._symAllRead
    // won't be returned until all task results are actually read.
    return Promise.race([
      this._error.promise.then(()=>{return this._symTaskRejected;}),
      this._result.promise.then(()=>{return this._symTaskResolved;}),
      this._empty.promise.then(()=>{return this._symAllRead;}),
    ]);
  }
  // informationals
  getCountWaiting(){return this._ts.getWaitingCount();}
  getCountWorking(){return this._ts.getWorkingCount();}
  getCountResolvedNotRead(){return this._qresults.length;}
  getCountRejectedNotRead(){return this._qerrors.length;}
  getCountFinishedNotRead(){
    return this._qresults.length+this._qerrors.length;
  }
  // the following are monotonically increasing totals, 
  getCountResolvedTotal(){return this._ts.getResolvedCount();}
  getCountRejectedTotal(){return this._ts.getRejectedCount();}
  getCountFinishedTotal(){return this._ts.getFinishedCount();}
}
module.exports.NextSymbol=NextSymbol;
