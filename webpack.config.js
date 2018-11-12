module.exports = {
    entry: './src/ui/new/entry.jsx',
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        }
      ]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },
    output: {
      path: __dirname + '/public/js',
      publicPath: '/',
      filename: 'newbundle.min.js'
    },
    devServer: {
      contentBase: './public/js'
    },
    mode:"development"
  };