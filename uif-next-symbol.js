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
    this._ts.onTaskEnd((result)=>{
      this._qresults.push(result);
      this._result.flag=true;
      this._result.resolve();
    });
    this._ts.onTaskError((error)=>{
      this._qerrors.push(error);
      this._error.flag=true;
      this._error.resolve();
    });
    this._ts.onEmpty(()=>{
      this._empty.resolve();
    });
    this._symTaskEnd=Symbol('taskEnd');
    this._symTaskError=Symbol('taskError');
    this._symEmpty=Symbol('empty');
  }
  getTaskEnd(){
    if (!this._result.flag) throw ('getTaskEnd - not ready');
    this._result=TaskSerializer._makepr();
    this._result.flag=false;
    return this._qresults.splice(0,1)[0];
  }
  getTaskError(){
    if (!this._error.flag) throw ('getTaskError - not ready');
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
  // isSymbolTaskEnd(sym){return sym===this._symTaskEnd;}
  // isSymbolTaskError(sym){return sym===this._symTaskError;}
  symbolEmpty(){return this._symEmpty;}
  symbolTaskEnd(){return this._symTaskEnd;}
  symbolTaskError(){return this._symTaskError;}
  nextSymbol(){// this promise can be safely abandoned
    return Promise.race([
      this._error.promise.then(()=>{return this._symTaskError;}),
      this._result.promise.then(()=>{return this._symTaskEnd;}),
      this._empty.promise.then(()=>{return this._symEmpty;}),
    ]);
  }
  // async promiseNextValue(){ // this promise canNOT be safely abandoned
  //   let sym=await this.promiseNextSymbol();
  //   if (this.isSymbolTaskError(sym))
  //     throw this.waitTaskError();
  //   else if (this.isSymbolTaskEnd(sym))
  //     return this.waitTaskEnd();
  //   else if (this.isSymbolEmpty(sym))
  //     return sym;    
  // }
}
module.exports.NextSymbol=NextSymbol;
