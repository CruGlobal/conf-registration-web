const webpack = require('webpack');
const path = require('path');

module.exports = {
  // Force .page prefix on page files (ex. index.page.tsx) so generated files can be included in /pages directory without Next.js throwing build errors
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js'],
  productionBrowserSourceMaps: true,
  webpack: (config, options) => ({
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.html$/,
          use: [
            'ngtemplate-loader?relativeTo=' +
              path.resolve(__dirname, './app') +
              '/',
            'html-loader',
          ],
        },
        {
          test: /pickadate/,
          parser: { amd: false },
        },
      ],
    },
    plugins: [
      ...config.plugins,
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery',
      }),
    ],
    resolve: {
      ...config.resolve,
      modules: [...config.resolve.modules, path.resolve(__dirname, 'app')],
    },
  }),
};
