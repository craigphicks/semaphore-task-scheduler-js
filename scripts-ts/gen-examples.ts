import {promises as fsp} from 'fs';
import fs=require('fs');
import {createPreprocStream} from 'mini-preproc';
import {create} from 'domain';
import assert=require('assert');

/*
 - js files
   - mini preproc (RELEASE:true/NODEJS:[true.false])
   - write to dest folder(s)
 - ts files
   - mini preproc (RELEASE:true/NODEJS:[true.false])
   - write to dest folder(s)
     - also write approroate tsconfig.js
*/


async function doOne(filenames:string[],srcdir:string,dstdir:string,isTS:boolean,
  nonodeSubdir:string,nodeSubdir:string):Promise<void>{
  assert.strict(Array.isArray(filenames));
  assert.strictEqual(typeof filenames[0],"string");
  assert.strictEqual(typeof srcdir,"string");
  assert.strictEqual(typeof dstdir,"string");
  assert.strictEqual(typeof isTS,"boolean");
  assert.strictEqual(typeof nonodeSubdir,"string");
  assert.strictEqual(typeof nodeSubdir,"string");
  let ext=isTS?'.ts':'.js';
  let subdirs:string[]=[nonodeSubdir,nodeSubdir];
  await fsp.rmdir(dstdir,{recursive:true});
  await fsp.mkdir(dstdir+'/'+subdirs[0],{recursive:true});
  await fsp.mkdir(dstdir+'/'+subdirs[1],{recursive:true});
  let proms:Promise<any>[]=[];
  for (let fn of filenames){
    let fnin=srcdir+'/'+fn+ext;
    for (let isnodejs of [false,true]){
      let fnout = dstdir+'/'+subdirs[Number(isnodejs)]+'/'+fn+ext;
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
export default doOne

// // @ts-ignore
// main(...process.argv.slice(2))
//   .then(()=>{process.exitCode=0;})
//   .catch((e)=>{console.error(e.message);process.exitCode=1;})
//   ;