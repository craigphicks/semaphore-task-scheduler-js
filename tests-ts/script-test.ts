'use strict';
import cp = require('child_process');
import {AsyncIter} from '../dist/index';

async function testone(cmd: string, aargs: string[]) {
  return await new Promise((resolve, reject) => {
    let outbuf: Buffer = Buffer.from('');
    let errbuf: Buffer = Buffer.from('');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let child: any = null;
    try {
      child = cp.spawn(cmd, aargs, {stdio: ['ignore', 'pipe', 'pipe']});
    } catch (e) {
      reject(
        new Error(
          `[spawn fail] ` + `${cmd},${JSON.stringify(aargs)}:: ${e.message}`
        )
      );
    }
    child.stdout.on('data', (data: string | Buffer) => {
      outbuf = Buffer.concat([outbuf, Buffer.from(data)]);
    });
    child.stderr.on('data', (data: string | Buffer) => {
      errbuf = Buffer.concat([errbuf, Buffer.from(data)]);
    });
    child.on('error', (e: Error) => {
      reject(`${cmd},${JSON.stringify(aargs)}:: ${e.message}`);
    });
    child.on('close', (code: number, signal: string) => {
      if (code || signal) {
        const msg = `
--- STDOUT ---
${outbuf.toString()}
--- STDERR ---
${errbuf.toString()}
--- ~~~~~~ ---
${cmd},${JSON.stringify(aargs)}::FAIL ${code},${signal}
--- ~~~~~~ ---
`;
        reject(new Error(msg));
      }
      resolve(`${cmd},${JSON.stringify(aargs)}::PASS ${code},${signal}`);
    });
  });
}

const progs = [
  'test-task-serializer.js',
  'demo-async-iter.js',
  'demo-callbacks.js',
  'demo-next-symbol.js',
  'demo-wait-all.js',
  'test-class-async-iter.js',
  'test-class-next-symbol.js',
];

function moduleDirname() {
  return __dirname;
}

async function main() {
  const ts = new AsyncIter();
  for (const prog of progs)
    ts.addTask(testone, 'node', [moduleDirname() + '/' + prog]);
  ts.addEnd();
  for await (const iter of ts) console.log(iter);
}
main()
  .then(() => {
    console.log('SUCCESS');
    process.exitCode = 0;
  })
  .catch((e) => {
    console.log('FAIL: ' + e.message);
    process.exitCode = 0;
  });
