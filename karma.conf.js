const path = require('path');
const {
  entry,
  devServer,
  optimization,
  ...webpackConfig
} = require('./webpack.config.js')({ test: true });

const karmaWebpackConfig = {
  ...webpackConfig,
  devtool: 'inline-source-map',
  module: {
    ...webpackConfig.module,
    rules: [
      ...webpackConfig.module.rules,
      ...(process.env.npm_lifecycle_event !== 'test-debug'
        ? [
            {
              test: /^(?!.*\.(spec|fixture)\.js$).*\.js$/,
              include: path.resolve('app/'),
              loader: 'istanbul-instrumenter-loader',
              query: {
                esModules: true,
              },
            },
          ]
        : []),
    ],
  },
};

module.exports = function(config) {
  config.set({
    singleRun: true,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    reporters: ['mocha', 'coverage-istanbul'],

    files: ['test/all-tests.spec.js'],

    preprocessors: {
      'test/all-tests.spec.js': ['webpack', 'sourcemap'],
    },

    webpack: karmaWebpackConfig,

    coverageIstanbulReporter: {
      reports: ['lcov'],
      fixWebpackSourcePaths: true,
    },
  });
};
