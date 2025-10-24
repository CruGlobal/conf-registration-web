module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['defaults'],
        },
        // transform-es2015-function-name is renaming function params in eventRegistrations that are needed for Angular DI
        exclude: ['@babel/plugin-transform-function-name'],
      },
    ],
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    test: {
      plugins: [
        'istanbul',
        // Must run AFTER istanbul to properly annotate DI
        'angularjs-annotate',
      ],
    },
  },
};
