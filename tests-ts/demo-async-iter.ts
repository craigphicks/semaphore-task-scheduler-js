//--IF{{RELEASE}}
//--import {AsyncIter} from 'task-serializer'
//--ELSE
import {AsyncIter} from '../dist/index';
//--ENDIF

//--IF{{NODEJS}}
import {exitOnBeforeExit, producer} from './demo-lib';
//--ELSE
//--import {producer} from './demo-lib';
//--ENDIF
async function consumer(ai: AsyncIter) {
  do {
    try {
      for await (const res of ai) {
        console.log('    ' + JSON.stringify(res));
      }
      break;
    } catch (e) {
      console.log('    ' + 'error: ' + e.message);
    }
    // eslint-disable-next-line no-constant-condition
  } while (true);
}
async function main() {
  const ai = new AsyncIter({concurrentTaskLimit: 2});
  await Promise.all([producer(ai), consumer(ai)]);
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
