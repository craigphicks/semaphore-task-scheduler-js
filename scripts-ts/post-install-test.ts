import {promises as fsp} from 'fs'
import genExamples from './gen-examples'
import * as cp from 'child_process'
import assert=require('assert')
/*
  Despite the name, this is not a test intended to be run after every install.
  It is a dev test to verify a prototype install. 
*/


function tsconfig(name:string,include:string[]){
return `{
  "extends": "@tsconfig/${name}/tsconfig.json",

  "compilerOptions": {
    "declaration": true,
    "noImplicitAny": true,
    "skipLibCheck": false,
    "sourceMap": true,
    "lib":[
      "es2015",
      "es2016",
      "es2017",
      "es2018",
      "es2019",
      "es2020",
      "esnext"
    ]
  },  
  "include": ${include}
}  
`;
}

(async()=>{
  assert.strictEqual(process.argv.length,6)
  assert.strictEqual(typeof process.argv[2],"string");
  assert.strictEqual(typeof process.argv[3],"string");
  assert.strictEqual(typeof process.argv[4],"string");
  assert.strictEqual(typeof process.argv[5],"string");
  let subdirs=["any","nodejs"];
  await Promise.all([
    // @ts-ignore
    genExamples(...process.argv.slice(2,4),false,...subdirs),
    // @ts-ignore
    genExamples(...process.argv.slice(4,6),true,...subdirs)
  ])  
  cp.execSync('npm install --save-dev typescript')
  let tsconfMnem=['recommended','node14'];
  let tsDstDir=process.argv[5];
  if (tsDstDir[0]!=='/' && tsDstDir.length>1 && tsDstDir.slice(0,2)!=='./')
    tsDstDir='./'+tsDstDir;
  for (let mnem of tsconfMnem){
    cp.execSync(`npm install --save-dev @tsconfig/${mnem}`);
    await fsp.writeFile(`./tsconfig.${mnem}.json`,tsconfig(mnem,[
      `${tsDstDir}/${mnem}/*.ts`
    ]));
  }
})()
.then(()=>{process.exitCode=0;})
.catch((e)=>{console.error(e.message);process.exitCode=1;})
;
