const {TaskSerializer}=require('./task-serializer.js');
class WaitAll{
  constructor({concurrentTaskLimit=0}={}){
    if (Object.keys(arguments).includes('0'))
      concurrentTaskLimit=arguments['0'];
    this._ts=new TaskSerializer(concurrentTaskLimit);
    this._results=[];
    this._error=TaskSerializer._makepr();
    this._empty=TaskSerializer._makepr();
    this._ts.onTaskResolved((result)=>{
      this._results.push(Promise.resolve(result));
    });
    this._ts.onTaskRejected((err)=>{
      // defuse the error so it doesn't become unhandled rejection
      // eslint-disable-next-line no-unused-vars
      let p=Promise.reject(err);
      p.catch(e=>e);//defuse
      this._results.push(p);
      this._error.resolve();
    });
    this._ts.onEmpty(()=>{
      this._empty.resolve();
    });
  }
  addTask(func,...args){
    this._ts.addTask(func,...args);
  }
  addEnd(){
    this._ts.addEnd();
  }
  async waitAll(){
    await Promise.race([this._error.promise,this._empty.promise]);
    return await Promise.all(this._results);
  }
  async waitAllSettled(){
    await this._empty.promise;
    return await Promise.allSettled(this._results);
  }
  // informationals
  getCountWaiting(){return this._ts.getWaitingCount();}
  getCountWorking(){return this._ts.getWorkingCount();}
  // the following are monotonically increasing totals, 
  getCountResolvedTotal(){return this._ts.getResolvedCount();}
  getCountRejectedTotal(){return this._ts.getRejectedCount();}
  getCountFinishedTotal(){return this._ts.getFinishedCount();}

}
module.exports.WaitAll=WaitAll;
