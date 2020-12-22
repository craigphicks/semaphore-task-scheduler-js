import * as cp from 'child_process'
import {promises as fsp} from 'fs'
import assert=require('assert')

import demoFilenames from './demo-filenames'
// mini-preproc must be installed for gen-examples module to load 
cp.execSync('npm install --save-dev mini-preproc')
import genExamples from './gen-examples'

/*
  Despite the name, this is not a test intended to be run after every install.
  It is a dev test to verify a prototype install. 
*/

function promit(func:Function,...args:any[]):Promise<any>{
  return new Promise((resolve,reject)=>{
    let cb_outer=(...cbargs:any[])=>{
      try{
        let r=args.slice(-1)[0](...cbargs);
        resolve(r);
      }catch(e){reject(e);}
    };
    func(...args.slice(0,-1),cb_outer);
  });
}

async function exec(cmd:string){
  await promit(cp.exec,cmd,
    (err:void|Error,stdout:Buffer|string,stderr:Buffer|string)=>{
      if (err){
        let msg=`
    ==================
    ::: ${cmd} ::: 
    ${err.message}
    ---STDOUT---
    ${stdout.toString()}
    ---STDERR---
    ${stderr.toString()}
    ==================
    `
        err.message=msg;
        throw err;
      }
      console.log('[OK] '+cmd);
  });
}


function tsconfig(name:string,ainclude:string[]){
return {
    "extends": `@tsconfig/${name}/tsconfig.json`,
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
    "include": ainclude
  }  
}

const tsconfMnem=['recommended','node14'];
const tsconfFns=[
  `./tsconfig.${tsconfMnem[0]}.json`,
  `./tsconfig.${tsconfMnem[1]}.json`
]

async function setupTypescript(tsDstDir_:string){
  let tsDstDir=tsDstDir_
  if (tsDstDir[0]!=='/' && tsDstDir.length>1 && tsDstDir.slice(0,2)!=='./')
    tsDstDir='./'+tsDstDir;
  let proms:Promise<any>[]=[];
  for (let i=0;i<2;i++){  
    let rootRelFns:string[]=[];
    for (let f of demoFilenames)
      rootRelFns.push(`${tsDstDir}/${tsconfMnem[i]}/${f}.ts`);
    proms.push(fsp.writeFile(
      tsconfFns[i],
      JSON.stringify(tsconfig(tsconfMnem[i],rootRelFns),null,2)
    ).then(()=>{
      console.log(`[OK] wrote ${tsconfFns[i]}`);
    }));
  }
  await Promise.all([
    Promise.all(proms),
    (async()=>{
      cp.execSync('npm install --save-dev typescript');
      console.log('[OK] npm install --save-dev typescript')
      cp.execSync('npm install --save-dev @types/node');
      console.log('[OK] npm install --save-dev @types/node')
      for (let mnem of tsconfMnem){
        cp.execSync(`npm install --save-dev @tsconfig/${mnem}`);
        console.log('[OK] '+`npm install --save-dev @tsconfig/${mnem}`)
      }
    })()
  ]);
}

async function demos(dstDir:string){
  let proms:Promise<any>[]=[];
  for (let mnem of tsconfMnem){
    for (let f of demoFilenames){
      let fn=`node ${dstDir}/${mnem}/${f}.js`;
      proms.push(exec(fn));
    }
  }
  await Promise.all(proms);
}

(async()=>{
  assert.strict(process.argv.length>=4)
  assert.strictEqual(typeof process.argv[2],"string");
  assert.strictEqual(typeof process.argv[3],"string");
  let doTS=true;
  if (process.argv.length==4)
    doTS=false;
  else {
    assert.strict(process.argv.length==6)
    assert.strictEqual(typeof process.argv[4],"string");
    assert.strictEqual(typeof process.argv[5],"string");
  }
  await Promise.all([
    (async()=>{
      let jsDstDir=process.argv[3];
      // @ts-ignore
      await genExamples(demoFilenames,...process.argv.slice(2,4),false,...tsconfMnem)
        .then(()=>{console.log('[OK] genExamples js')});//js
      await demos(jsDstDir)
        .then(()=>{console.log('[OK] js demos done')});
    })(),
    (async()=>{
      if (!doTS) return Promise.resolve();
      let tsDstDir=process.argv[5];
      await Promise.all([
        // @ts-ignore
        genExamples(demoFilenames,...process.argv.slice(4,6),true,...tsconfMnem)
          .then(()=>{console.log('[OK] genExamples ts')}),//ts
        setupTypescript(tsDstDir)
          .then(()=>{console.log('[OK] setupTypescript')}),
      ]);
      await Promise.all([
        exec(`tsc -p ${tsconfFns[0]}`),
        exec(`tsc -p ${tsconfFns[1]}`)
      ]).then(()=>{console.log('ready to start ts demos')});
      await demos(tsDstDir);
    })()
  ]);
})()
.then(()=>{console.log('PASS');process.exitCode=0;})
.catch((e)=>{console.error(e.message);process.exitCode=1;})
;
