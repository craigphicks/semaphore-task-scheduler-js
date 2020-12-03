'use_strict';

const {test_SemaphoreTaskScheduler}=require('./semaphore-task-scheduler.js');


test_SemaphoreTaskScheduler()
  .then(()=>{
    console.log('test_SemaphoreTaskScheduler.then ');
    process.exitCode=0;

  })
  .catch((e)=>{
    console.error('test_SemaphoreTaskScheduler.catch '+ e.message);
    process.exitCode=1;
  });

process.on('beforeExit',async()=>{
  if (typeof process.exitCode=='undefined'){
    console.error('unexpected "beforeExit" event');
    process.exit(2);
  } else 
    process.exit(process.exitCode);
});


