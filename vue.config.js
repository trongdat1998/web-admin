const mockFiles = require('./mock/index')
const apiMocker = require('mocker-api')
const ProxyAgent = require('proxy-agent')

const getIp = () => {
  var interfaces = require('os').networkInterfaces()
  for (var devName in interfaces) {
    var iface = interfaces[devName]
    for (var i = 0; i < iface.length; i++) {
      var alias = iface[i]
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      ) {
        return alias.address
      }
    }
  }
}

module.exports = {
  lintOnSave: false,
  publicPath: '/',
  // 选项...
  outputDir: 'build',
  assetsDir: 'static',
  productionSourceMap: false,
  css: {
    loaderOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  chainWebpack: (config) => {
    // 移除 prefetch 插件
    config.plugins.delete('prefetch')

    if (process.env.NODE_ENV === 'production') {
      config.plugin('html').tap((args) => {
        Object.assign(args[0].minify, {
          minifyJS: true,
          minifyCSS: true,
        })
        return args
      })
    }
  },
  devServer: {
    https: true,
    open: true,
    before(app) {
      apiMocker(app, mockFiles)
    },
    proxy: {
      '/api': {
        target: 'https://broker-admin-9001.headsc.dev/',
        changeOrigin: true,
        cookieDomainRewrite: 'localhost',
        // agent: new ProxyAgent('http://10.3.12.91:1196'),
        headers: {
          authority: 'broker-admin-9001.headsc.dev',
          'x-forwarded-host': 'broker-admin-9001.headsc.dev',
          Referer: 'https://broker-admin-9001.headsc.dev',
        },
      },
    },
  },
}
