const path = require('path')

module.exports = name => ({
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: `/src/${name}`,
  output: {
    path: '/dist',
    filename: name,
    library: {
      type: 'this',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
    alias: { '@starships/core': '/src/starships-core' },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: '14',
                  },
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.json'),
          },
        },
      },
    ],
  },
})
