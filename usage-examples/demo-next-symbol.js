'use strict';
const {NextSymbol}=require('task-serializer');
const {makepr,exitOnBeforeExit,producer}=require('./demo-lib.js');

var somethingElse=makepr();
var iv=setInterval(()=>{somethingElse.resolve("somethingElse");},300);  
async function consumer(ts){
  let emptied=false;
  while(!emptied){
    let next = await Promise.race([
      somethingElse.promise,
      ts.nextSymbol(),
    ]);
    switch(next){
    case "somethingElse":
      console.log(next);
      somethingElse=makepr();// reset
      break;
    case ts.symbolTaskResolved():{
      console.log();
      let res=ts.getTaskResolvedValue();
      console.log("symbolTaskResolved, result="+res);
      break;}
    case ts.symbolTaskRejected():{
      let e=ts.getTaskRejectedValue();
      console.log("symbolTaskRejected, message="+e.message);
      break;}
    case ts.symbolEmpty():{
      console.log("symbolEmpty");
      emptied=true;
      clearInterval(iv);
      break;}
    }
  }
}
async function main(){
  let ts=new NextSymbol({concurrentTaskLimit:2});
  await Promise.all([consumer(ts),producer(ts)]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure: '+e.message);process.exitCode=1;})
;
exitOnBeforeExit(2);
