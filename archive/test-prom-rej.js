/* eslint-disable no-unused-vars */
'use strict';
const fs=require('fs');

// const verbotten=new Error('verbotten');
// class MyError extends Error {
//   constructor(message){
//     //super(message); 
//     return verbotten;
//   }
// }

// console.log("(new MyError()) instanceof MyError="+((new MyError()) instanceof MyError));

// const forbidden = Promise.reject(new Error('FORBIDDEN'));
// forbidden.catch(err=>console.log(`mark error ${err} as handled`));

function makeSignal(){
  let s={};s.promise=new Promise((r)=>{s.resolve=r;});return s;
}


// async function test1(){
//   try {
//     await (async()=>{throw new Error('!');})();  
//   } catch(e){console.log(e.message);} // outputs: !
//   try {
//     (()=>{throw forbidden;})();  
//   } catch(e){console.log(e.message);} // outputs: 'undefined'
//   try {
//     await (async()=>{throw forbidden;})();  
//   } catch(e){console.log(e.message);} // outputs: 'undefined'
//   try {
//     await (async()=>{throw new MyError();})();  
//   } catch(e){console.log(e.message);} // outputs: 'verbotten'
//   // uncomment any one of hte following to trigger UHR (unhandled rejection)
//   //await (async()=>{throw forbidden;})(); // UHR + '#<Promise>' + no address leak
//   //await (async()=>{throw new Error('!');})(); // UHR + '!' + address leak
//   //await (async()=>{throw new MyError();})();  // UHR + 'verbotten' + no address leak
// }
// async function test3(){
//   try {
//     let a = await (async()=>{return forbidden;})();  
//   } catch(e){console.log(e.message);} // outputs: 'FORBIDDEN'
//   try {
//     let a = (()=>{return forbidden;})();  
//   } catch(e){console.log(e.message);} // never reaches here
//   console.log("something else");
//   await (async()=>{return forbidden;})();  // UHR + '#<Promise>' + no addr leak}
//   //await (async()=>{throw new MyError();})();  // UHR + 'verbotten' + no }
// }
//test3();
// process.on('uncaughtException', (err, origin) => {
//   fs.writeSync(
//     process.stderr.fd,
//     `Caught exception: ${err}\n` +
//     `Exception origin: ${origin}`
//   );
// });
// process.on('unhandledRejection', (reason, promise) => {
//   fs.writeSync(
//     process.stderr.fd,
//     `reason: ${reason}\n` +
//     `promise: ${promise}`
//   );
//   //process.exitCode=99;
// });

async function test2(){
  let s = makeSignal();
  let f = async(str)=>{
    await s.promise;
    throw Error(str);
  };  
  let p=f('f1');//.catch((e)=>{console.log('f1 '+e.message);});
  let q=p;
  var r=p;
  let z;
  //z=f('f2').catch((e)=>{console.log('z.1 '+e.message);});// bad! now z is a dud.
  (z=f('f2')).catch((e)=>{console.log('z.1 '+e.message);});// good. 
  var a=(async()=>{return z;})();
  await Promise.all([
    (async()=>{
      await z.catch((e)=>{console.log('z.2 '+e.message);});
      await p.catch((e)=>{console.log('p.1 '+e.message);});
      await p.catch((e)=>{console.log('p.2 '+e.message);});
      await q.catch((e)=>{console.log('q.p '+e.message);});
      //await p;  
    })(),
    (async()=>{
      s.resolve();
      //await r.catch((e)=>{console.log('r '+e.message);});
      //(a=await z).catch(e=>console.log('a '+e.message));
      await z.catch(e=>console.log('a '+e.message));
    })()
  ]);
  console.log(z);
  console.log(r);
}
test2();

process.on('beforeExit',async()=>{
  if (typeof process.exitCode=='undefined'){
    console.error('unexpected "beforeExit" event');
    process.exit(2);
  } else 
    process.exit(process.exitCode);
});