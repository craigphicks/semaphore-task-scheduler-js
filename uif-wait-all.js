const {TaskSerializer}=require('./task-serializer.js');
class WaitAll{
  constructor({concurrentLimit=0}={}){
    this._ts=new TaskSerializer(concurrentLimit);
    this._results=[];
    this._error=TaskSerializer._makepr();
    this._empty=TaskSerializer._makepr();
    this._ts.onTaskEnd((result)=>{
      this._results.push(Promise.resolve(result));
    });
    this._ts.onTaskError((err)=>{
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
}
module.exports.WaitAll=WaitAll;
