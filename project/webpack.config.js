'use strict';

// https://createapp.dev/webpack

const webpack = require('webpack');
const path = require('path');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const config = {
  entry: ['./src/index.js'],
  output: {
    path: path.resolve("./dist"),
    filename: 'scripts/[name].[hash:5].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: []
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: '',
            }
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('autoprefixer')()
              ]
            }
          }
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        use:  {
          loader: 'file-loader',
          options: {
            outputPath: 'fonts',
            name: '[name].[hash:5].[ext]'
          }
        }
      },
      {
        test: /\.(svg|png|jpe?g)$/,
        use: {
          loader: 'file-loader',
          options: {
            outputPath: 'img',
            name: '[name].[ext]'
          }
        },
      }
    ]
  },
  plugins: [
    new LodashModuleReplacementPlugin,
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html'
    }),
    new HtmlWebpackPlugin({
      template: './add-content.html',
      filename: 'add-content.html'
    }),
    new HtmlWebpackPlugin({
      template: './favorites.html',
      filename: 'favorites.html'
    }),
    new HtmlWebpackPlugin({
      template: './show-content.html',
      filename: 'show-content.html'
    }),
    new HtmlWebpackPlugin({
      template: './sign-in.html',
      filename: 'sign-in.html'
    }),
    new HtmlWebpackPlugin({
      template: './sign-up.html',
      filename: 'sign-up.html'
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[hash:5].css',
    }),
    new CopyPlugin([
      { from: './img', to: './img' },
      { from: './content', to: './content' }
    ]),
  ],
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};

module.exports = config;