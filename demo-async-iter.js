'use strict';
//--IF{{RELEASE}}
//--const {AsyncIter}=require('task-serializer');
//--ELSE
/* eslint-disable no-constant-condition */
const {AsyncIter}=require('./uif-async-iter.js');
//--ENDIF
//--IF{{NODEJS}}
const {exitOnBeforeExit,producer}=require('./demo-lib.js');
//--ELSE
//--const {producer}=require('./demo-lib.js');
//--ENDIF
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
//--IF{{NODEJS}}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});
exitOnBeforeExit(2);
//--ELSE
//--main()
//--  .then(()=>{console.log('success');})
//--  .catch((e)=>{console.log('failure '+e.message);});
//--ENDIF
