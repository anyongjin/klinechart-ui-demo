export default defineAppConfig({
    ws_url: 'ws://localhost:9000',  // 仅针对开发环境，生产环境通过nginx转发
    device: {
      enabled: true,
      defaultUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36',
      refreshOnResize: false
    }
  })