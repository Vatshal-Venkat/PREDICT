const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.jsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.VITE_API': JSON.stringify(process.env.VITE_API || ''),
      'process.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || ''),
      'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || ''),
      'process.env.REACT_APP_API_BASE': JSON.stringify(process.env.REACT_APP_API_BASE || ''),
      'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL || ''),
      'process.env.API_BASE': JSON.stringify(process.env.API_BASE || ''),
    }),
  ],
  devServer: {
    port: 5173,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
};
