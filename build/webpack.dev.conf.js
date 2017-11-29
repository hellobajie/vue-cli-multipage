'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const glob = require('glob')

var configObj = {
    module: {
      rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
    },
    // cheap-module-eval-source-map is faster for development
    devtool: config.dev.devtool,
  
    // these devServer options should be customized in /config/index.js
    devServer: {
      clientLogLevel: 'warning',
      historyApiFallback: true,
      hot: true,
      compress: true,
      host: process.env.HOST || config.dev.host,
      port: process.env.PORT || config.dev.port,
      open: config.dev.autoOpenBrowser,
      overlay: config.dev.errorOverlay ? {
        warnings: false,
        errors: true,
      } : false,
      publicPath: config.dev.assetsPublicPath,
      proxy: config.dev.proxyTable,
      quiet: true, // necessary for FriendlyErrorsPlugin
      watchOptions: {
        poll: config.dev.poll,
      }
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': require('../config/dev.env')
      }),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
      new webpack.NoEmitOnErrorsPlugin(),
    ]
  }


  configObj.entry = {};
  var fileList = glob.sync('./src/*.js');
  var fileNameList = [];
  fileList.forEach(function (item, index) {
      var name = item.match(/(\/)(\w+)(\.)/g)[0].substring(1, item.match(/(\/)(\w+)(\.)/g)[0].length - 1);
      fileNameList.push(name);
  })
  var obj = {};
  fileList.forEach(function (item, index) {
      var filename = fileNameList[index];
      configObj.entry[filename] = item;
      configObj.plugins.push(new HtmlWebpackPlugin({
          template: './src/pages/' + filename + '.html',
          filename: filename + '.html',
          inject: true,
          chunks: [filename]
      }))
  })

const devWebpackConfig = merge(baseWebpackConfig, configObj)

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${config.dev.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
