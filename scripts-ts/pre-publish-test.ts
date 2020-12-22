import genExamples from './gen-examples'
import demoFilenames from './demo-filenames'
(async()=>{
  await Promise.all([
    // @ts-ignore
    genExamples(demoFilenames,...process.argv.slice(2,4),false,"any","nodejs"),
    // @ts-ignore
    genExamples(demoFilenames,...process.argv.slice(4,6),true,"any","nodejs")
  ])  
})()
.then(()=>{process.exitCode=0;})
.catch((e)=>{console.error(e.message);process.exitCode=1;})
;

