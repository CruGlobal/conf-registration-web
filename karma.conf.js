// Tell babel to run in test mode to enable the istanbul plugin
process.env.NODE_ENV = 'test';

const { entry, devServer, optimization, ...webpackConfig } =
  require('./webpack.config.js')({ test: true });

const karmaWebpackConfig = {
  ...webpackConfig,
  devtool: 'inline-source-map',
};

module.exports = function (config) {
  config.set({
    singleRun: true,

    frameworks: ['jasmine'],

    browsers: ['ChromeHeadlessNoSandbox'],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox'],
      },
    },

    reporters: ['mocha', 'coverage-istanbul'],

    files: ['test/all-tests.spec.js'],

    preprocessors: {
      'test/all-tests.spec.js': ['webpack', 'sourcemap'],
    },

    webpack: karmaWebpackConfig,

    coverageIstanbulReporter: {
      dir: 'coverage/karma',
      reports: ['lcov'],
      fixWebpackSourcePaths: true,
    },
  });
};
