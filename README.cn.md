# KlineCharts-UI-Demo
这是一个示例项目，使用KlineCharts绘制金融K线图，界面UI从[KLineChart Pro](https://pro.klinecharts.com/getting-started.html)改写(KLineChart Pro使用Solid-js，本项目改写为vue3)  
本项目使用[Next 3](https://nuxt.com/docs/getting-started/introduction)和[VUE 3](https://vuejs.org/guide/introduction.html)

# 如何使用
由于交易界面UI要求的定制性一般比较高，将此项目打包为package不太适合自由修改。  
所以建议直接clone本项目，提取需要的部分，自由修改页面组件和UI  

# 后端数据来源
**使用CoinGecko数据(CoingeckoDatafeed)**  
来源于 https://www.coingecko.com/zh/api/documentation， 免费版无需申请API Key，但数据很有限。  
**使用Polygon数据(PolygonDatafeed)**  
来源于 https://polygon.io/ ，在使用前需要去申请API key。  
**使用自定义数据(MyDatafeed)**  
后端服务运行在`http://127.0.0.1:8000`，接口数据规约可参考MyDatafeed


# 其他注意
 **多语言i18n**  
不要使用nuxt官方的i18n模块，使用[这个](https://vue-i18n.intlify.dev/guide/integrations/nuxt3.html)  

# Nuxt 3 配置

### 安装项目
```bash
yarn install
```
### 开发模式运行
```bash
yarn dev
```
