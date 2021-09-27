module.exports = name => ({
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production',
  entry: `/src/${name}`,
  experiments: { outputModule: true },
  output: {
    path: '/dist',
    filename: name,
    library: {
      type: 'this',
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.jsx', '.js', '.mjs', '.cjs'],
    alias: { '@starships-core': '/src/starships-core.ts' },
  },
  module: {
    rules: [
      {
        test: '/.jsx?$/',
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
        test: '/.tsx?$/',
        use: {
          loader: 'ts-loader',
        },
      },
    ],
  },
})
