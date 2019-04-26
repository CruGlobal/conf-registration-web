import 'scripts/main.js';

// require all spec files
const testsContext = require.context(
  '../',
  true,
  /\.\/(app|test\/spec).*\.spec\.js$/,
);
testsContext.keys().forEach(testsContext);
