const path = require('path')
const webpack = require('webpack')
const { getLoader, loaderByName } = require('@craco/craco')
const absolutePath = path.join(__dirname, '../common')
module.exports = {
  webpack: {
    alias: {},
    plugins: [
      // https://stackoverflow.com/a/68723223
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser'
      })
    ],
    configure: (webpackConfig, { env, paths }) => {
      const { isFound, match } = getLoader(
        webpackConfig,
        loaderByName('babel-loader')
      )
      if (isFound) {
        const include = Array.isArray(match.loader.include)
          ? match.loader.include
          : [match.loader.include]
        match.loader.include = include.concat[absolutePath]
      }
      // https://github.com/facebook/create-react-app/discussions/11782
      const fallback = {
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        fs: false,
        path: require.resolve('path-browserify'),
        crypto: require.resolve('crypto-browserify')
      }
      Object.assign(webpackConfig.resolve, { fallback })
      return webpackConfig
    }
  }
}
