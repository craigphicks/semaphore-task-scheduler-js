// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs');

const pkgJson = JSON.parse(fs.readFileSync('./package.json').toString());
if (Object.keys(pkgJson.dependencies).length != 0) {
  console.error('package.json has dependencies, but expected none');
  process.exitCode = 1;
} else process.exitCode = 0;
