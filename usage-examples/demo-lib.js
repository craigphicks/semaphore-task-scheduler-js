'use strict';
var {AsyncIter,NextSymbol}=require('task-serializer');
function snooze(ms){return new Promise(r=>setTimeout(r,ms));}
function range(len){return [...Array(len).keys()];}
function makepr(){
  let pr={};
  pr.promise=new Promise((r)=>{pr.resolve=r;});
  return pr;
}
function logStatus(ts){
  let wa=ts.getCountWaiting();
  let wo=ts.getCountWorking();
  let rest=ts.getCountResolvedTotal();
  let rejt=ts.getCountRejectedTotal();
  let fint=ts.getCountFinishedTotal();
  console.log(
    `wa:${wa},wo:${wo},rest:${rest},rejt:${rejt},fint:${fint}`);
  if ((ts instanceof AsyncIter)||(ts instanceof NextSymbol)){
    let resnr=ts.getCountResolvedNotRead();
    let rejnr=ts.getCountRejectedNotRead();
    let finnr=ts.getCountFinishedNotRead();
    console.log(`resnr:${resnr},rejnr:${rejnr},finnr:${finnr}`);
  }
}
async function task(id,ms,err=false){
  console.log(`-->enter ${id}`);
  if (err)
    throw new Error(`task failed id=${id}`);
  await snooze(ms);
  console.log(`<--leave ${id}`);
  return `task ${id}, took ${ms}ms`;
}
async function producer(ts){
  for (let i=0; i<6; i++){
    ts.addTask(task,i,2**(10-i),(i+1)%3==0);
    await snooze(100);
  }
  ts.addEnd();
  console.log('producer finished');
}
module.exports.snooze=snooze;
module.exports.task=task;
module.exports.range=range;
module.exports.makepr=makepr;
module.exports.producer=producer;

