const {TaskSerializer}=require('./task-serializer.js');
class NextSymbol{
  constructor({
    concurrentTaskLimit=0,
  }={}){
    this._ts=new TaskSerializer(concurrentTaskLimit);
    this._result=TaskSerializer._makepr();
    this._result.flag=false;
    this._error=TaskSerializer._makepr();
    this._error.flag=false;
    this._qresults=[];
    this._qerrors=[];
    this._empty=TaskSerializer._makepr();
    this._ts.onTaskResolved((result)=>{
      this._qresults.push(result);
      this._result.flag=true;
      this._result.resolve();
    });
    this._ts.onTaskRejected((error)=>{
      this._qerrors.push(error);
      this._error.flag=true;
      this._error.resolve();
    });
    this._ts.onEmpty(()=>{
      this._empty.resolve();
    });
    this._symTaskResolved=Symbol('TaskResolved');
    this._symTaskRejected=Symbol('TaskRejected');
    this._symEmpty=Symbol('empty');
  }
  getTaskResolvedValue(){
    if (!this._result.flag) throw new Error('getTaskResolvedValue - not ready');
    this._result=TaskSerializer._makepr();
    this._result.flag=false;
    return this._qresults.splice(0,1)[0];
  }
  getTaskRejectedValue(){
    if (!this._error.flag) throw new Error('getTaskRejectedValue - not ready');
    this._error=TaskSerializer._makepr();
    this._error.flag=false;
    return this._qerrors.splice(0,1)[0];
  }
  addTask(func,...args){
    this._ts.addTask(func,...args);
  }
  addEnd(){
    this._ts.addEnd();
  }
  // isSymbolEmpty(sym){return sym===this._symEmpty;}
  // isSymbolTaskResolved(sym){return sym===this._symTaskResolved;}
  // isSymbolTaskRejected(sym){return sym===this._symTaskRejected;}
  symbolEmpty(){return this._symEmpty;}
  symbolTaskResolved(){return this._symTaskResolved;}
  symbolTaskRejected(){return this._symTaskRejected;}
  nextSymbol(){// this promise can be safely abandoned
    return Promise.race([
      this._error.promise.then(()=>{return this._symTaskRejected;}),
      this._result.promise.then(()=>{return this._symTaskResolved;}),
      this._empty.promise.then(()=>{return this._symEmpty;}),
    ]);
  }
  // async promiseNextValue(){ // this promise canNOT be safely abandoned
  //   let sym=await this.promiseNextSymbol();
  //   if (this.isSymbolTaskRejected(sym))
  //     throw this.waitTaskRejected();
  //   else if (this.isSymbolTaskResolved(sym))
  //     return this.waitTaskResolved();
  //   else if (this.isSymbolEmpty(sym))
  //     return sym;    
  // }
}
module.exports.NextSymbol=NextSymbol;
