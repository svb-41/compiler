const path = require('path')

module.exports = name => {
  return {
    mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
    entry: `/src/${name}`,
    optimization: { minimize: false },
    output: {
      path: '/dist',
      filename: name.replace(/\.ts$/g, '.js'),
      library: { type: 'this' },
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'],
      // alias: { '@svb-41/core': '/src/starships-core.js' },
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-env', { targets: { node: '14' } }]],
            },
          },
        },
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: path.resolve(__dirname, 'tsconfig.json'),
              errorFormatter: message => {
                return JSON.stringify(message)
              },
            },
          },
        },
      ],
    },
  }
}
