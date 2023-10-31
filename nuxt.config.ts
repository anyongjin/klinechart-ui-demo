// https://nuxt.com/docs/api/configuration/nuxt-config
const backendHost = process.env.inter_aipp_host || 'http://127.0.0.1:8000'
const defaultLocale = process.env.NODE_ENV == 'production' ? 'en-US': 'zh-CN'


export default defineNuxtConfig({
  devtools: {enabled: true},
  // @ts-ignore
  modules: [
    '@nuxtjs/i18n',
    '@element-plus/nuxt',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-lodash'
  ],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
  },
  nitro: {
    devProxy: {
      '/api': {
        // https://github.com/http-party/node-http-proxy#options
        target: backendHost,
        changeOrigin: true
      }
    }
  },
  elementPlus: {
    importStyle: 'scss'
  },
  lodash: {
    prefix: "_",
    prefixSkip: ["string"],
    upperAfterPrefix: false,
    exclude: ["map"],
    alias: [
      ["camelCase", "stringToCamelCase"], // => stringToCamelCase
      ["kebabCase", "stringToKebab"], // => stringToKebab
      ["isDate", "isLodashDate"], // => _isLodashDate
    ],
  },
  i18n: {
    strategy: 'prefix',
    defaultLocale,
    langDir: 'locales',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'all',
    },
    locales: [
      {code: 'zh-CN', name: '简体中文', file: 'zh-CN.json'},
    ]
  },
  piniaPersistedstate: {
    // pinia默认使用cookie进行持久化
    cookieOptions: {
      sameSite: 'strict',
    },
    storage: 'cookies'
  },
  routeRules: {
    '/api/**': {
      // 用于开发者以生产模式运行，生产环境不会走这里
      proxy: { to: `${backendHost}/**`, },
    }
  }
})
