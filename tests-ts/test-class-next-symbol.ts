'use strict';
import {NextSymbol} from '../dist/index.js';
import {task,/*makepr,snooze*/} from './demo-lib.js';
async function testAsyncIter(){
  let ts=new NextSymbol();
  ts.addTask(task,0,11,false);
  ts.addTask(task,1,10,false);
  ts.addTask(task,2,10,true);
  ts.addTask(task,3,10,true);
  ts.addEnd();
  let r=[];
  out: for (;;){
    switch (await ts.nextSymbol()){
    case ts.symbolTaskResolved():
      r.push(ts.getTaskResolvedValue());
      break;
    case ts.symbolTaskRejected():
      r.push(ts.getTaskRejectedValue().message);
      break;
    case ts.symbolAllRead():
      break out;
    }
  }
  console.log(JSON.stringify(r,null,2));
}
testAsyncIter()
  .then(()=>{console.log("success");process.exitCode=0;})
  .catch((e)=>{console.log("failure: "+e.message);process.exitCode=1;});  