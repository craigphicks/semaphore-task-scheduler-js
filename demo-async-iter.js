/* eslint-disable no-constant-condition */
'use strict';

const {AsyncIter}=require('./uif-async-iter.js');
const {task,snooze,range,exitOnBeforeExit}=require('./demo-lib.js');

async function producer(ai){
  range(6).forEach(async(i)=>{
    await snooze(i*100);
    ai.addTask(task,i.toString(),2**(10-i),(i+1)%3==0);
    if (i==5) ai.addEnd();
  });
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
  let ai=new AsyncIter(2);
  await Promise.all([producer(ai),consumer(ai)]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});

exitOnBeforeExit(2);
