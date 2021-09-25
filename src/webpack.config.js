module.exports = fileID => ({
  mode: 'production',
  entry: `/src/${fileID}`,
  output: {
    path: '/dist',
    filename: fileID,
  },
  module: {
    rules: [
      {
        test: '/.js$/',
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
})
