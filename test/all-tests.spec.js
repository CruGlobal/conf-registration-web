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
