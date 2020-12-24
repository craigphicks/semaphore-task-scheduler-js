const fs=require('fs');
const cp=require('child_process');

function promit(func,...args){
  return new Promise((resolve,reject)=>{
    let cb_outer=(...cbargs)=>{
      try{
        let r=args.slice(-1)[0](...cbargs);
        resolve(r);
      }catch(e){reject(e);}
    };
    func(...args.slice(0,-1),cb_outer);
  });
}

function tsconfigFn(mnem){
  return `./tmp.tsconfig.${mnem}.json`;
}

const jsonOrig=
  JSON.parse(
    fs.readFileSync('./tsconfig.json').toString());

async function doOne(mnem){
  let distfn=`./dist-${mnem}`;
  await promit(fs.rmdir,distfn,{recursive:true},(err,data)=>{
    if (err) throw err; else return data;
  });
  await promit(fs.mkdir,distfn,(err)=>{
    if (err) throw err;
  });
  let json={...jsonOrig,
    "extends": `@tsconfig/${mnem}/tsconfig.json`,
  };
  json.compilerOptions={...jsonOrig.compilerOptions,
    "outDir": `./dist-${mnem}`
  };
  await promit(fs.writeFile,tsconfigFn(mnem),
    JSON.stringify(json,0,2),(err)=>{
      if (err) throw err;
    });
  await promit(cp.exec,`tsc -p ${tsconfigFn(mnem)}`,(err,stdin,stdout)=>{
    if (err){
      let msg=`
===STDOUT===
${stdout.toString()}
===STDERR===
${stdout.toString()}
---message---
${err.message}
~~~~~~~~~~~~~
`;
      throw new Error(msg);
    }
  }); 
}
async function main(){
  let proms=[];
  for (let mnem of [
    'recommended',
    'node10',
    'node12',
    'node14'
  ]){
    proms.push(doOne(mnem).catch((e)=>{
      e.message=mnem+":::"+e.message;
      throw e;
    }));
  }
  Promise.all(proms);
}
main().then(()=>{process.exitCode=0;})
  .catch((e)=>{console.log(e.message);process.exitCode=1;})
;