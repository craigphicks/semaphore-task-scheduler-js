
import type {Promolve} from './lib'
import {makePromolve} from './lib'
import {Common,CommonCtorParams} from './uif-common'

class WaitAll extends Common{
  _results:any[]
  _error:Promolve
  _empty:Promolve
  constructor(...args:CommonCtorParams){
    super(...args)
    this._results=[];
    this._error=makePromolve();
    this._empty=makePromolve();
    this._ts.onTaskResolved((result:any)=>{
      this._results.push(Promise.resolve(result));
    });
    this._ts.onTaskRejected((err:any)=>{
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
  async waitAll(){
    await Promise.race([this._error.promise,this._empty.promise]);
    return await Promise.all(this._results);
  }
  async waitAllSettled(){
    await this._empty.promise;
    // @ts-ignore
    return await Promise.allSettled(this._results);
  }
}
export {WaitAll}
