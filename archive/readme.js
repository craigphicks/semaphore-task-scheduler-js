'use strict';
const {TaskSerializer}=require('./task-serializer.js');
function snooze(t){return new Promise((r)=>{setTimeout(r,t);});}
function status(sts){
  return `working:${sts.getWorkingCount()},`
  +`waiting:${sts.getWaitingCount()},finished:${sts.getFinishedCount()}`;
}
async function example(){
  let sts=new TaskSerializer(2,true);
  let myfunc=async(id,ms)=>{
    console.log(`entering ${id}`);
    await snooze(ms);
    console.log(`    leaving ${id}`);
  };
  for (let i=0;i<5; i++){
    sts.addTask(myfunc,i.toString(),13);
    await snooze(0);
    console.log(status(sts));
    await snooze(2);
  }
  await sts.waitAll();
  await snooze(0);
  console.log(status(sts));
}
example();