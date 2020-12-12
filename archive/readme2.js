'use strict';
const {TaskSerializer}=require('./task-serializer.js');
function snooze(t){return new Promise((r)=>{setTimeout(r,t);});}
function status(sts){
  return `working:${sts.getWorkingCount()},`
  +`waiting:${sts.getWaitingCount()},finished:${sts.getFinishedCount()}`;
}
function makePr(){
  let pr={};
  pr.promise=new Promise((r)=>{pr.resolve=r;});
  return pr;
}
let myfunc=async(id,isErr,ms)=>{
  console.log(`    <-entering ${id}`);
  await snooze(ms);
  if (isErr){
    console.log(`    ->throw error ${id}`);
    throw new Error(id);
  }
  console.log(`    ->leaving ${id}`);
  return id;
};

async function example(){
  let sts=new TaskSerializer(2);
  sts.onTaskResolved((ret)=>{console.log(`  onTaskResolvedCb ${ret}`);});
  sts.onTaskRejected((e)=>{console.log(`  onTaskRejectedCb ${e.message}`);});
  let empty={}; empty.promise=new Promise((r)=>{empty.resolve=r;});
  sts.onEmpty(()=>{console.log(`  onEmptyCb`);empty.resolve();});
  for (let i=0;i<5; i++){
    sts.addTask(myfunc,i.toString(),i%2,13);
    await snooze(0);
    console.log(status(sts));
    await snooze(2);
  }
  await empty.promise;
  await snooze(0);
  console.log(status(sts));
}
example();