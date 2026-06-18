import 'scripts/main.js';

// require all spec files under test/spec/
const testsContext = require.context('.', true, /\.\/spec\/.*\.spec\.js$/);
testsContext.keys().forEach(testsContext);

// require all spec files colocated under app/features/
const featureTestsContext = require.context(
  '../app/features',
  true,
  /\.spec\.js$/,
);
featureTestsContext.keys().forEach(featureTestsContext);

// require all spec files colocated under app/scripts/
const scriptsTestsContext = require.context(
  '../app/scripts',
  true,
  /\.spec\.js$/,
);
scriptsTestsContext.keys().forEach(scriptsTestsContext);
