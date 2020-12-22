'use strict';
//--IF{{RELEASE}}
//--const {NextSymbol}=require('task-serializer');
//--ELSE
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {NextSymbol} = require('../dist/uif-next-symbol.js');
//--ENDIF
//--IF{{NODEJS}}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {exitOnBeforeExit, makepr, producer} = require('./demo-lib.js');
//--ELSE
//--const {makepr,producer}=require('./demo-lib.js');
//--ENDIF
var somethingElse = makepr();
var iv = setInterval(() => {
  somethingElse.resolve('somethingElse');
}, 300);
async function consumer(ts) {
  let emptied = false;
  while (!emptied) {
    let next = await Promise.race([somethingElse.promise, ts.nextSymbol()]);
    switch (next) {
      case 'somethingElse':
        console.log(next);
        somethingElse = makepr(); // reset
        break;
      case ts.symbolTaskResolved(): {
        console.log();
        let res = ts.getTaskResolvedValue();
        console.log('symbolTaskResolved, result=' + res);
        break;
      }
      case ts.symbolTaskRejected(): {
        let e = ts.getTaskRejectedValue();
        console.log('symbolTaskRejected, message=' + e.message);
        break;
      }
      case ts.symbolAllRead(): {
        console.log('symbolAllRead');
        emptied = true;
        clearInterval(iv);
        break;
      }
    }
  }
}
async function main() {
  let ts = new NextSymbol({concurrentTaskLimit: 2});
  await Promise.all([consumer(ts), producer(ts)]);
}
//--IF{{NODEJS}}
main()
  .then(() => {
    console.log('success');
    process.exitCode = 0;
  })
  .catch((e) => {
    console.log('failure ' + e.message);
    process.exitCode = 1;
  });
exitOnBeforeExit(2);
//--ELSE
//--main()
//--  .then(()=>{console.log('success');})
//--  .catch((e)=>{console.log('failure '+e.message);});
//--ENDIF
