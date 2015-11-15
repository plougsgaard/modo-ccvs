var webpack = require('webpack')

module.exports = {
  entry: [
    './js/entry.js'
  ],
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel?stage=0'
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json']
  },
  output: {
    path: __dirname + '/dist',
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: './dist',
    hot: true
  }
}
