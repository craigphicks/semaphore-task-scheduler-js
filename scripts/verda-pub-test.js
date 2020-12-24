const cp = require('child_process');
const fs = require('fs');
const pj = require('../package.json');

async function exec(cmd, aargs) {
  await new Promise((resolve, reject) => {
    console.log(`$$$$$$ ${cmd + ' ' + aargs.join(' ')}`);
    const c = cp.spawn(cmd, aargs, {
      stdio: ['ignore', 'inherit', 'inherit'],
    });
    c.on('error', (e) => {
      reject(new Error(e));
    });
    c.on('close', (code) => {
      if (code) reject(new Error(`(on close) returned code=${code}`));
      else resolve();
    });
    c.on('exit', (code) => {
      if (code) reject(new Error(`(on exit) returned code=${code}`));
      else resolve();
    });
  });
}

async function main() {
  console.log(pj.devConfig.verdaccioUrl);
  await exec('npm', [
    '-d',
    '--registry',
    pj.devConfig.verdaccioUrl,
    'unpublish',
    '--force',
  ]);
  await exec('npm', ['--registry', pj.devConfig.verdaccioUrl, 'publish']);
  fs.mkdirSync(`/tmp/verda-pub-test`, {recursive: true});
  const tdir = fs.mkdtempSync(`/tmp/verda-pub-test/`);
  console.log(`$$$$$$ cd ${tdir}`);
  process.chdir(tdir);
  await exec('npm', [
    '--registry',
    pj.devConfig.verdaccioUrl,
    'install',
    pj.name,
  ]);
  await exec('npm', ['init', '-y']);
  await exec('bash', [
    `node_modules/${pj.name}/scripts/post-install-demo-jsonly.sh`,
  ]);
  await exec('bash', [`node_modules/${pj.name}/scripts/post-install-demo.sh`]);
}
main()
  .then(() => {
    console.log('SUCESS');
    process.exitCode = 0;
  })
  .catch((e) => {
    console.log(`FAIL ${e.message}`);
    process.exitCode = 1;
  });
