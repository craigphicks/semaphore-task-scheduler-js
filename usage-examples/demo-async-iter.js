'use strict';
const {AsyncIter}=require('task-serializer');
const {producer}=require('./demo-lib.js');
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
  let ai=new AsyncIter({concurrentTaskLimit:2});
  await Promise.all([producer(ai),consumer(ai)]);
}
main()
  .then(()=>{console.log('success');})
  .catch((e)=>{console.log('failure '+e.message);});
