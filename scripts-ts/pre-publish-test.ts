import genExamples from './gen-examples';
import demoFilenames from './demo-filenames';
(async () => {
  await Promise.all([
    genExamples(
      demoFilenames,
      process.argv[2],
      process.argv[3],
      false,
      'any',
      'nodejs'
    ),
    genExamples(
      demoFilenames,
      process.argv[4],
      process.argv[5],
      true,
      'any',
      'nodejs'
    ),
  ]);
})()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
