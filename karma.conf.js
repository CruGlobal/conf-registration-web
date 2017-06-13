const path = require('path');
const webpackConfig = require('./webpack.config.js')({ test: true });

delete webpackConfig.entry;
delete webpackConfig.devServer;
webpackConfig.devtool = 'inline-source-map';
webpackConfig.module.rules.push({
  test: /^(?!.*\.(spec|fixture)\.js$).*\.js$/,
  include: path.resolve('app/'),
  loader: 'istanbul-instrumenter-loader',
  query: {
    esModules: true
  }
});

module.exports = function(config) {
  config.set({

    singleRun: true,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    reporters: ['mocha', 'coverage-istanbul'],

    files: [
      'test/all-tests.spec.js'
    ],

    preprocessors: {
      'test/all-tests.spec.js': ['webpack', 'sourcemap']
    },

    webpack: webpackConfig,

    coverageIstanbulReporter: {
      reports: [ 'lcov'],
      fixWebpackSourcePaths: true
    },
  });
};
