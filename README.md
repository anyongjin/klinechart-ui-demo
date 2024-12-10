[中文文档](./README.cn.md)

# KlineCharts-UI-Demo
This is a sample project that uses KlineCharts to draw financial candlestick charts. The UI interface is modified from [KLineChart Pro](https://pro.klinecharts.com/getting-started.html) (KLineChart Pro uses Solid-js, this project is rewritten in Vue3).  
This project uses [Nuxt 3](https://nuxt.com/docs/getting-started/introduction) and [Vue 3](https://vuejs.org/guide/introduction.html).

If you need the svelte version, please go to [klinecharts-demo-svelte](https://github.com/anyongjin/klinecharts-demo-svelte)

This demo is based on 9.5.4. If you need to upgrade to version 10.0, please refer to the relevant file changes in [klinecharts-demo-svelte](https://github.com/anyongjin/klinecharts-demo-svelte)


# How to Use
Since the customization requirements for the trading UI are usually high, packaging this project as a package may not be suitable for freely modifying. Therefore, it is recommended to directly clone this project, extract the required parts, and freely modify the page components and UI.

# Backend Data Source
**Using CoinGecko data (CoinGeckoDatafeed)**  
Source: https://www.coingecko.com/en/api/documentation. The free version does not require an API key, but the data is limited.

**Using Polygon data (PolygonDatafeed)**  
Source: https://polygon.io/. An API key is required before using it.

**Using custom data (MyDatafeed)**  
The backend service runs at `http://127.0.0.1:8000`. The interface data specification can refer to MyDatafeed.

# Other Notes
**Multilingual i18n**
Do not use the official nuxt i18n module, use [this](https://vue-i18n.intlify.dev/guide/integrations/nuxt3.html).

# Nuxt 3 Configuration

### Install Project
```bash
yarn install
```

### Run in Development Mode
```bash
yarn dev
```

### Deploy in Production Mode
```bash
yarn build && node .output/server/index.mjs
```