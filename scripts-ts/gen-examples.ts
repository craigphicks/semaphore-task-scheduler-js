import * as fsp from 'fs/promises';
import fs=require('fs');
import {createPreprocStream} from 'mini-preproc';
import {create} from 'domain';


/*
 - js files
   - mini preproc (RELEASE:true/NODEJS:[true.false])
   - write to dest folder(s)
 - ts files
   - mini preproc (RELEASE:true/NODEJS:[true.false])
   - write to dest folder(s)
     - also write approroate tsconfig.js
*/

const filenames=[
  //"demo-all.sh",
  "demo-async-iter.js",
  "demo-callbacks.js",
  "demo-next-symbol.js",
  "demo-wait-all.js",
  "demo-lib.js",
];

async function doOne(srcdir:string,dstdir:string,isTS:false){
  let subdirs:string[]=['any','nodejs'];
  await fsp.rmdir(dstdir,{recursive:true});
  await fsp.mkdir(dstdir+'/'+subdirs[0],{recursive:true});
  await fsp.mkdir(dstdir+'/'+subdirs[1],{recursive:true});
  let proms:Promise<any>[]=[];
  for (let fn of filenames){
    let fnin=srcdir+'/'+fn;
    for (let isnodejs of [false,true]){
      let fnout = dstdir+'/'+subdirs[Number(isnodejs)]+'/'+fn;
      proms.push(new Promise<any>((resolve,reject)=>{
        fs.createReadStream(fnin)
        .pipe(createPreprocStream({
          "RELEASE":true,
          "NODEJS":isnodejs
        },{strip:true}))
        .on('error',(e)=>{
          e.message=`${fnin},${fnout},${e.message}`;
          reject(e);})
        .pipe(fs.createWriteStream(fnout))
        .on('close',resolve);
      }));
    }
  }
  await Promise.all(proms);
}
async function main(
  srcdir_js:string,
  srcdir_ts:string,
  dstdir_fromjs:string,
  dstdir_fromts:string,
){
  if (
    typeof srcdir_js!='string'
  || typeof srcdir_ts!='string'
  || typeof dstdir_fromjs!='string'
  || typeof dstdir_fromts!='string'
  ){
    console.log(`
usage:
  node ${process.argv[1]} srcdir dstdirNodeJSFalse dstdirNodeJsTrue isTS
`
    );
    return;
  }

  let proms:Promise<any>[]=[]
  for (let args of [
    [srcdir_js,dstdir_fromjs,false],
    [srcdir_ts,dstdir_fromts,true]
  ]){
    if (args[0]==='') continue;
    // @ts-ignore
    proms.push(doOne(...args));
  }
  await Promise.all(proms);

}
// @ts-ignore
main(...process.argv.slice(2))
  .then(()=>{process.exitCode=0;})
  .catch((e)=>{console.error(e.message);process.exitCode=1;})
  ;