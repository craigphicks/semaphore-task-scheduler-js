const {NextSymbol}=require('./uif-next-symbol.js');
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
