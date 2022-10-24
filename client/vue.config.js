/* eslint-disable @typescript-eslint/no-var-requires */

const { defineConfig } = require('@vue/cli-service')

//
// @vue/cli-service configuration
// see: https://cli.vuejs.org/config/#global-cli-config
//

// Put the package version into the vue app with an environment variable
process.env.VUE_APP_NAME = require('./package.json').name
process.env.VUE_APP_VERSION = require('./package.json').version

module.exports = defineConfig({
  lintOnSave: true,
  css: {
    loaderOptions: {
      sass: {
        additionalData: '@import "@/scss/common.scss";',
      },
    },
  },
  chainWebpack: (config) => {
    // Use non-standard yaml
    config.resolve.extensions.add('.yml').add('.yaml')

    // Clear the existing svg rule and load as a component instead
    // const svgRule = config.module.rule('svg')
    // svgRule.uses.clear()
    // // prettier-ignore
    // svgRule
    //   .use('babel-loader')
    //     .loader('babel-loader')
    //     .end()
    //   .use('vue-svg-loader')
    //     .loader('vue-svg-loader')

    // prettier-ignore
    // load mdx files and convert into vue components
    // config.module
    //   .rule('mdx')
    //   .test(/.mdx?$/)
    //   .use('babel-loader')
    //     .loader('babel-loader')
    //     .end()
    //   .use('@mdx-js/vue-loader')
    //     .loader('@mdx-js/vue-loader')
    //     .end()

    // prettier-ignore
    // load yaml data in and convert into javascript objects
    config.module
      .rule('yaml')
      .test(/\.ya?ml?$/)
      .use('json-loader')
        .loader('json-loader')
        .end()
      .use('yaml-loader')
        .loader('yaml-loader')
        .end()

    // Load markdown into text strings
    // prettier-ignore
    // config.module
    //   .rule('md')
    //   .test(/\.md$/)
    //   .use('raw-loader')
    //     .loader('raw-loader')
    //     .end()
    //   .use('markdown-loader')
    //     .loader('markdown-loader')
    //     .end()

    // Use the slim socket.io in production
    config.resolve.alias.set(
      'socket.io-client',
      process.env.NODE_ENV === 'development'
        ? 'socket.io-client'
        : 'socket.io-client/dist/socket.io.js'
    )
  },
})
