/* eslint-disable no-constant-condition */
'use strict';

const {AsyncIterTaskScheduler}=require('./async-iter.js');
function range(len){return [...Array(len).keys()];}
function snooze(ms){return new Promise(r=>setTimeout(r,ms));}

async function task(id,ms,err=false){
  console.log(`-->enter ${id}`);
  if (err)
    throw new Error(`task failed id=${id}`);
  await snooze(ms);
  console.log(`<--leave ${id}`);
  return [id,ms];
}
async function producer(ai){
  range(6).forEach(i=>{
    ai.addTask(task,i.toString(),2**(10-i),(i+1)%3==0);
  });
  ai.addEnd();
}
async function consumer(ai){
  do{
    try{
      for await(const res of ai){
        console.log('    '+JSON.stringify(res));
      }
      break;
    }catch(e){
      console.log('    '+'error: '+e.message);
    }
  }while(true);
}
async function main(){
  let ai=new AsyncIterTaskScheduler(2);
  await Promise.all([producer(ai),consumer(ai)]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});
process.on('beforeExit',async()=>{
  if (typeof process.exitCode=='undefined'){
    console.error('unexpected "beforeExit" event');
    process.exit(2);
  } else 
    process.exit(process.exitCode);
});
