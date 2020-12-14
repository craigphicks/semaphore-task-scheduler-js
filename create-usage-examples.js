'use strict';
const {createPreprocStream}=require('mini-preproc');
const fs=require('fs');
async function oneSet(nodeJSonly){
  let outdir=nodeJSonly?
    './usage-examples-nodejs-only':'./usage-examples';
  fs.mkdirSync(outdir,{recursive:true});
  let proms=[];
  for (let fn of [
    "demo-all.sh",
    "demo-async-iter.js",
    "demo-callbacks.js",
    "demo-next-symbol.js",
    "demo-wait-all.js",
    "demo-lib.js",
  ]){
    proms.push(new Promise((resolve,reject)=>{
      fs.createReadStream('./'+fn)
        .on('error',reject)
        .pipe(createPreprocStream({
          RELEASE:true,
          NODEJS:nodeJSonly
        },
        {strip:true}))
        .on('error',reject)
        .pipe(fs.createWriteStream(outdir+'/'+fn))
        .on('error',reject)
        .on('finish',resolve);
    }));
  }
  await Promise.all(proms);
}
async function main(){
  await Promise.all([oneSet(false),oneSet(true)]);
}
//oneSet(false)
main()
  .then(()=>{console.log("success"); process.exitCode=0;})
  .catch((e)=>{console.log("failure: "+e.message); process.exitCode=1;});