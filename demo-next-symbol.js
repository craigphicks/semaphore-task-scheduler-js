const {NextSymbol}=require('./uif-next-symbol.js');
const {snooze,task,makepr,exitOnBeforeExit}=require('./demo-lib.js');


async function producer(ts){
  for (let i=0; i<6; i++){
    ts.addTask(task,i,2**(10-i),(i+1)%3==0);
    await snooze(100);
  }
  ts.addEnd();
  console.log('producer finished');
}

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
    case ts.symbolTaskEnd():{
      console.log();
      let res=ts.getTaskEnd();
      console.log("symbolTaskEnd, result="+res);
      break;}
    case ts.symbolTaskError():{
      let e=ts.getTaskError();
      console.log("symbolTaskError, message="+e.message);
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

