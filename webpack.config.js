const webpack = require('webpack');
const path = require('path');
const concat = require('lodash/concat');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  HtmlWebpackSkipAssetsPlugin,
} = require('html-webpack-skip-assets-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const { SubresourceIntegrityPlugin } = require('webpack-subresource-integrity');
const ESLintPlugin = require('eslint-webpack-plugin');
const hostnames = require('./app/scripts/utils/hostnames.json');

const htmlMinDefaults = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  removeCDATASectionsFromCDATA: true,
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeAttributeQuotes: true,
  useShortDoctype: true,
  keepClosingSlash: true,
  minifyJS: true,
  minifyCSS: true,
  removeScriptTypeAttributes: true,
  removeStyleTypeAttributes: true,
};

// Everything read from the environment is read when the config is built, not
// when this file loads, so one copy of it can build several configs.
module.exports = (env = {}) => {
  const isTest = env.test;
  const isBuild = (process.env.npm_lifecycle_event || '').startsWith('build');
  const ci = process.env.CI === 'true';
  const coverage = ci || process.env.COVERAGE === 'true';
  return {
    mode: isBuild ? 'production' : 'development',
    // Cache compiled modules to avoid cold webpack rebuild during retesting.
    cache: isTest
      ? {
          type: 'filesystem',
          buildDependencies: { config: [__filename] },
          // Babel emits instrumented vs. uninstrumented modules depending on
          // whether coverage is on (see babel-angular.config.js), so each
          // value gets its own cache slot.
          version: `coverage=${coverage}`,
        }
      : undefined,
    entry: {
      app: ['scripts/main.js', 'styles/style.scss'],
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
      devtoolModuleFilenameTemplate: (info) =>
        info.resourcePath.replace(/^\.\//, ''),
      crossOriginLoading: 'anonymous',
    },
    optimization: {
      moduleIds: isBuild ? 'named' : undefined,
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
          },
        },
      },
    },
    plugins: concat(
      [
        new webpack.EnvironmentPlugin({
          // Error reports are sent only when the build has both of these.
          ROLLBAR_ACCESS_TOKEN: '',
          ROLLBAR_ENDPOINT: '',
          // The image build passes GIT_SHA, GitHub Actions sets GITHUB_SHA and
          // Netlify sets COMMIT_REF. Dockerfile labels the source maps with
          // the same GIT_SHA, so reports and maps name the same version.
          GIT_COMMIT_SHA:
            process.env.GIT_SHA ||
            process.env.GITHUB_SHA ||
            process.env.COMMIT_REF ||
            'development',
        }),
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery',
        }),
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        }),
      ],
      // ESLint runs separately via `yarn lint`, so skip the redundant pass
      // when webpack is building the test bundle.
      !isTest
        ? [
            new ESLintPlugin({
              extensions: ['js', 'ts', 'tsx'],
              // Show errors as warnings during development to prevent start/test commands from exiting
              failOnError: isBuild || ci,
              emitWarning: !isBuild && !ci,
            }),
            new HtmlWebpackPlugin({
              template: 'app/index.ejs',
              // The same page serves staging and production, so it picks its
              // Tag Manager environment and banner from the hostname.
              productionHostnames: hostnames.production,
              minify: htmlMinDefaults,
            }),
          ]
        : [],
      isBuild
        ? [
            new HtmlWebpackPlugin({
              template: 'app/browserUnsupported.ejs',
              filename: 'browserUnsupported.html',
              excludeAssets: /.*\.js/, // Only import CSS
              minify: htmlMinDefaults,
            }),
            new HtmlWebpackPlugin({
              template: 'app/maintenanceMode.ejs',
              filename: 'maintenanceMode.html',
              excludeAssets: /.*\.js/, // Only import CSS
              minify: htmlMinDefaults,
            }),
            new HtmlWebpackSkipAssetsPlugin(),
            new FaviconsWebpackPlugin('./app/img/favicon.png'),
            new SubresourceIntegrityPlugin({
              hashFuncNames: ['sha512'],
            }),
          ]
        : [],
      env.analyze ? [new BundleAnalyzerPlugin()] : [],
    ),
    module: {
      rules: [
        {
          test: /\.(ts|js)x?$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                configFile: path.resolve(__dirname, 'babel-angular.config.js'),
                plugins: !isTest ? ['angularjs-annotate'] : [],
              },
            },
          ],
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'ngtemplate-loader',
              options: {
                relativeTo: path.resolve(__dirname, './app'),
              },
            },
            'html-loader',
          ],
        },
        {
          test: /\.(scss|css)$/,
          use: [
            MiniCssExtractPlugin.loader,
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: true,
                sassOptions: {
                  precision: 8, // fixes line height issue with bootstrap button addons | See Link for more detail:  https://github.com/twbs/bootstrap-sass#sass-number-precision
                  quietDeps: true,
                },
              },
            },
          ],
        },
        {
          test: /\.(woff|ttf|eot|ico)/,
          type: 'asset/resource',
          generator: {
            filename: '[name].[contenthash][ext]',
          },
        },
        {
          test: /\.(svg|png|jpe?g|gif)/,
          type: 'asset/resource',
          generator: {
            filename: '[name].[contenthash][ext]',
          },
          use: [
            {
              loader: 'image-webpack-loader',
              options: {},
            },
          ],
        },
        {
          test: /pickadate/,
          parser: { amd: false },
        },
      ],
    },
    resolve: {
      modules: [path.resolve(__dirname, 'app'), 'node_modules'],
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    // A build emits its source maps but leaves the bundles without a
    // sourceMappingURL comment. The image moves the maps out of the site, so
    // they are never served, and the deploy sends them to the error tracker.
    // Netlify previews and the dev server keep linked maps for the browser's
    // devtools. The image build never sets NETLIFY.
    devtool:
      isBuild && process.env.NETLIFY !== 'true'
        ? 'hidden-source-map'
        : 'source-map',
    devServer: {
      historyApiFallback: true,
      port: 9000,
    },
  };
};
