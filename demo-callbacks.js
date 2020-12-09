const {Callbacks}=require('./uif-callbacks.js');
const {snooze,task,exitOnBeforeExit}=require('./demo-lib.js');

async function producer(ts){
  for (let i=0; i<6; i++){
    ts.addTask(task,i,2**(10-i),(i+1)%3==0);
    await snooze(100);
  }
  ts.addEnd();
  console.log('producer finished');
}
async function consumer(ts){
  await new Promise((resolve)=>{
    ts.onTaskEnd((result)=>{
      console.log(`onTaskEnd ${result}`);
    });
    ts.onTaskError((err)=>{
      console.log(`onTaskError ${err}`);
    });
    ts.onEmpty(()=>{
      console.log(`onEmpty`);
      resolve();
    });
  });
  console.log('consumer finished');
}

async function main(){
  let ts=new Callbacks({concurrentLimit:2});
  return await Promise.all([
    consumer(ts),// consumer must initialize first
    producer(ts)
  ]);
}
main()
  .then(()=>{console.log('success');process.exitCode=0;})
  .catch((e)=>{console.log('failure '+e.message);process.exitCode=1;});

exitOnBeforeExit(2);
