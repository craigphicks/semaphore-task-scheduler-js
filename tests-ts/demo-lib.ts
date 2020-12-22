//--IF{{RELEASE}}
//--import {AsyncIter,Callbacks,NextSymbol, WaitAll} from 'task-serializer';
//--ELSE
import {AsyncIter,Callbacks,NextSymbol,WaitAll} from '../dist/index';
//--ENDIF
function snooze(ms:number){return new Promise(r=>setTimeout(r,ms));}
function range(len:number){return [...Array(len).keys()];}
interface Promolve{promise:Promise<any>,resolve:(r:any)=>void}
function makepr():Promolve{
  let pr={};
  // @ts-expect-error
  pr.promise=new Promise((r)=>{pr.resolve=r;});
  // @ts-expect-error
  return pr;
}
function logStatus(ts:any){
  let wa=ts.getCountWaiting();
  let wo=ts.getCountWorking();
  let rest=ts.getCountResolvedTotal();
  let rejt=ts.getCountRejectedTotal();
  let fint=ts.getCountFinishedTotal();
  console.log(
    `wa:${wa},wo:${wo},rest:${rest},rejt:${rejt},fint:${fint}`);
  if ((ts instanceof AsyncIter)||(ts instanceof NextSymbol)){
    let resnr=ts.getCountResolvedNotRead();
    let rejnr=ts.getCountRejectedNotRead();
    let finnr=ts.getCountFinishedNotRead();
    console.log(`resnr:${resnr},rejnr:${rejnr},finnr:${finnr}`);
  }
}
async function task(id: any,ms: number,err=false){
  console.log(`-->enter ${id}`);
  if (err)
    throw new Error(`task failed id=${id}`);
  await snooze(ms);
  console.log(`<--leave ${id}`);
  return `task ${id}, took ${ms}ms`;
}
async function producer(ts:AsyncIter|NextSymbol|Callbacks|WaitAll){
  for (let i=0; i<6; i++){
//--IF{{RELEASE}}
//--ELSE
    logStatus(ts);
//--ENDIF
    ts.addTask(task,i,2**(10-i),(i+1)%3==0);
    await snooze(100);
  }
//--IF{{RELEASE}}
//--ELSE
  logStatus(ts);
//--ENDIF
  ts.addEnd();
  console.log('producer finished');
}

export {snooze,task,range,makepr,producer}

//--IF{{NODEJS}}
function exitOnBeforeExit(exitCode: number){
  process.on('beforeExit',async()=>{
    if (typeof process.exitCode=='undefined'){
      console.error('unexpected "beforeExit" event');
      process.exit(exitCode);
    } else 
      process.exit(process.exitCode);
  });
}
export {exitOnBeforeExit}
//--ENDIF
