const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const concat = require('lodash/concat');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');
const InlineManifestWebpackPlugin = require('inline-manifest-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const SriPlugin = require('webpack-subresource-integrity');

const isBuild = (process.env.npm_lifecycle_event || '').startsWith('build');
const ci = process.env.CI === 'true';
const prod = process.env.TRAVIS_BRANCH === 'master';

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
  removeStyleTypeAttributes: true
};

module.exports = env => {
  env = env || {};
  const isTest = env.test;
  return {
    entry: {
      app: 'scripts/main.js'
    },
    output: {
      filename: '[name].[chunkhash].js',
      path: path.resolve(__dirname, 'dist'),
      devtoolModuleFilenameTemplate: info => info.resourcePath.replace(/^\.\//, ''),
      crossOriginLoading: 'anonymous'
    },
    plugins: concat(
      [
        new webpack.ProvidePlugin({
          '$': 'jquery',
          'jQuery': 'jquery',
          'window.jQuery': 'jquery'
        }),
        new ExtractTextPlugin({
          filename: "[name].[contenthash].min.css"
        })
      ],
      !isTest ? [
        new HtmlWebpackPlugin({
          template: 'app/index.ejs',
          prod: prod,
          minify: htmlMinDefaults
        }),
      ] : [],
      isBuild ?
        [
          new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks: function (module) {
              // This prevents stylesheet resources with the .css or .scss extension
              // from being moved from their original chunk to the vendor chunk
              if(module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
                return false;
              }
              return module.context && module.context.indexOf("node_modules") !== -1;
            }
          }),
          new webpack.optimize.CommonsChunkPlugin({
            name: "manifest",
            minChunks: Infinity
          }),
          new webpack.NamedModulesPlugin(),
          new HtmlWebpackPlugin({
            template: 'app/browserUnsupported.ejs',
            filename: 'browserUnsupported.html',
            excludeAssets: /.*\.js/, // Only import CSS
            minify: htmlMinDefaults
          }),
          new HtmlWebpackPlugin({
            template: 'app/maintenanceMode.ejs',
            filename: 'maintenanceMode.html',
            excludeAssets: /.*\.js/, // Only import CSS
            minify: htmlMinDefaults
          }),
          new HtmlWebpackExcludeAssetsPlugin(),
          new InlineManifestWebpackPlugin({
            name: 'webpackManifest'
          }),
          new FaviconsWebpackPlugin('./app/img/favicon.png'),
          new SriPlugin({
            hashFuncNames: ['sha512']
          })
        ] : [],
      env.analyze ? [ new BundleAnalyzerPlugin() ] : []

    ),
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                presets: [['env', { 'modules': false, exclude: ['transform-es2015-function-name'] }]], // transform-es2015-function-name is renaming function params in eventRegistrations that are needed for Angular DI
                plugins: concat(['transform-runtime'], !isTest ? ['angularjs-annotate'] : [])
              }
            }
          ]
        },
        {
          test: /\.html$/,
          use: ['ngtemplate-loader?relativeTo=' + path.resolve(__dirname, './app') + '/', 'html-loader']
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          enforce: "pre",
          options: {
            // Show errors as warnings during development to prevent start/test commands from exiting
            failOnError: isBuild || ci,
            emitWarning: !isBuild && !ci
          }
        },
        {
          test: /\.(scss|css)$/,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  sourceMap: true
                }
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: true,
                  precision: 10 // fixes line height issue with bootstrap button addons
                }
              }
            ]
          })
        },
        {
          test: /\.(woff|ttf|eot|ico)/,
          use: [{
            loader: 'file-loader',
            options: {
              name: '[name].[hash].[ext]'
            }
          }]
        },
        {
          test: /\.json/,
          use: ['json-loader']
        },
        {
          test: /\.(svg|png|jpe?g|gif)/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[hash].[ext]'
              }
            },
            {
              loader: 'image-webpack-loader',
              options: {}
            }
          ]
        },
        {
          test: /pickadate/,
          parser: { amd: false }
        }
      ]
    },
    resolve: {
      modules: [path.resolve(__dirname, "app"), "node_modules"]
    },
    devtool: "source-map",
    devServer: {
      historyApiFallback: true,
      port: 9000
    }
  };
};
