const webpack = require('webpack');
const path = require('path');

/*
 * We've enabled ExtractTextPlugin for you. This allows your app to
 * use css modules that will be moved into a separate CSS file instead of inside
 * one of your module entries!
 *
 * https://github.com/webpack-contrib/extract-text-webpack-plugin
 *
 */

const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/main.js',

  output: {
    filename: '[name].bundle.js',
    sourceMapFilename: "[name].map",
    path: path.resolve(__dirname, 'dist/')
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',

        options: {
          sourceMap: true,
          presets: ['es2015']
        }
      },
      {
        test: /\.(less|css)$/,

        use: ExtractTextPlugin.extract({
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'less-loader'
            }
          ],
          fallback: 'style-loader'
        })
      }
    ]
  },

  devtool: 'source-map',
  resolve: {
   extensions: ['.js', '.jsx'],
  },

  plugins: [
    new ExtractTextPlugin('styles.css')
  ]
};
