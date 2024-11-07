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

const isBuild = (process.env.npm_lifecycle_event || '').startsWith('build');
const ci = process.env.CI === 'true';
const prod = process.env.GITHUB_REF === 'refs/heads/master';

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

module.exports = (env = {}) => {
  const isTest = env.test;
  return {
    mode: isBuild ? 'production' : 'development',
    entry: {
      app: ['scripts/main.js', 'styles/style.scss'],
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve(__dirname, 'dist'),
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
          ROLLBAR_ACCESS_TOKEN:
            JSON.stringify(process.env.ROLLBAR_ACCESS_TOKEN) ||
            'development-token',
        }),
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          'window.jQuery': 'jquery',
        }),
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css',
        }),
        new ESLintPlugin({
          extensions: ['js', 'ts', 'tsx'],

          // Show errors as warnings during development to prevent start/test commands from exiting
          failOnError: isBuild || ci,
          emitWarning: !isBuild && !ci,
        }),
      ],
      !isTest
        ? [
            new HtmlWebpackPlugin({
              template: 'app/index.ejs',
              prod: prod,
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
    devtool: 'source-map',
    devServer: {
      historyApiFallback: true,
      port: 9000,
    },
  };
};
