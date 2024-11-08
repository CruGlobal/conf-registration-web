import 'scripts/main.js';

// require all spec files
const testsContext = require.context('.', true, /\.\/spec\/.*\.spec\.js$/);
testsContext.keys().forEach(testsContext);
