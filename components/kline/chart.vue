<script setup lang="ts">
import {
  ActionType,
  Chart,
  DomPosition,
  Nullable,
  PaneOptions,
  Styles,
  Indicator,
  OverlayCreate,
  KLineData
} from 'klinecharts'
import kc from 'klinecharts'
import _ from "lodash"
import {type PaneInds, type Period, type SymbolInfo, type AddDelInd, type BarArr} from '~/composables/types'
import {computed, defineProps, onMounted, onUnmounted, reactive, ref, toRaw, watch} from "vue";
import {
  AllPeriods,
  getDefStyles,
  getThemeStyles,
  GetNumberDotOffset,
  build_ohlcvs, useKlineObjs
} from "~/composables/kline/coms";
import {adjustFromTo, tf_to_secs, toUTCStamp, getDateStr, makeFormatDate} from "~/composables/dateutil"
import overlays from '~/composables/kline/overlays'
import figures from '~/composables/kline/figure'
import {useAuthState} from "~/composables/auth";
import {GetIndDefaults} from "~/components/kline/inds";
import {useKlineLocal} from "~/stores/klineLocal";
import {useI18n} from "vue-i18n";
import {useRoute, useNuxtApp} from "#app";
import {useKlineStore} from "~/stores/kline";
import {getDefaults} from "~/config";
import {type ApiResult} from "~/utils/netio";
import {addChartBars} from "~/composables/kline/kc_exts";
import indicators from "~/composables/kline/indicators";
const {t} = useI18n()
const route = useRoute()
const defaults = getDefaults()

overlays.forEach(o => { kc.registerOverlay(o) })
figures.forEach(o => { kc.registerFigure(o) })

interface ChartProp{
  hasRight?: boolean,
  customLoad?: boolean,
}

const props = withDefaults(defineProps<ChartProp>(), {
  hasRight: false,
  customLoad: false
})

const klocal = useKlineLocal()
const main = useKlineStore()
const {datafeed} = useKlineObjs()
const {authDoing, authStatus} = useAuthState()
const chartRef = ref<HTMLElement>()
const drawBarRef = ref<any>(null)
const batch_num = ref(500)
const {$on} = useNuxtApp()
let priceUnitDom: HTMLElement
let loading = false
let tf_msecs = 0
let cloud_ind_loaded = false;
type NoParamFunc = () => void
let cloud_ind_cbs: NoParamFunc[] = [];

const watermark = ref('')

const periods = reactive<Period[]>(AllPeriods)

indicators.forEach(o => {
  if(o.extendData == 'datafeed'){
    o.extendData = datafeed
  }
  kc.registerIndicator(o)
})


function setIndicator({is_main, ind_name, is_add}: AddDelInd){
  if(!main.chart)return
  const paneId = is_main ? 'candle_pane' : 'pane_' + ind_name
  if(is_add){
    const ind = createIndicator(main.chart, ind_name, undefined, true, {id: paneId})
    ind && klocal.save_inds.push(ind)
  }
  else{
    main.chart?.removeIndicator(paneId, ind_name)
    klocal.removeInd(paneId, ind_name)
  }
}
// 这个事件由ind_search_modal触发
$on('set_ind', setIndicator)

function createIndicator (widget: Nullable<Chart>, name: string, params?: any[], isStack?: boolean, paneOptions?: PaneOptions): Nullable<any> {
  if (name === 'VOL') {
    paneOptions = { gap: { bottom: 2 }, ...paneOptions }
  }
  const calcParams = params ?? GetIndDefaults(name);
  const ind_id = widget?.createIndicator({
    name, calcParams,
    // @ts-expect-error
    createTooltipDataSource: ({ indicator, defaultStyles }) => {
      const icon_ids = [indicator.visible ? 1: 0, 2, 3];
      const icons = icon_ids.map(i => defaultStyles.tooltip.icons[i])
      return { icons }
    }
  }, isStack, paneOptions)
  if(!ind_id)return null
  const pane_id = paneOptions?.id ?? ''
  return {name, pane_id, params: calcParams}
}

async function loadKlineData(from: number, to: number, isNewData?: boolean){
  loading = true
  const strategy = route.query.strategy?.toString()
  const kdata = await datafeed.getHistoryKLineData({
    symbol: klocal.symbol, period: klocal.period, from, to, strategy})
  if(isNewData){
    kdata.data.forEach(bar => {
      main.chart?.updateData(bar)
    })
  }
  else{
    const more = kdata.data.length > 0
    main.chart?.applyMoreData(kdata.data, more)
  }
  main.klineLoaded += 1
  kdata.lays?.forEach(o => {
    drawBarRef.value?.addOverlay(o)
  })
  loading = false
}


const documentResize = () => {
  main.chart?.resize()
}

onMounted(() => {
  window.addEventListener('resize', documentResize)
  main.chart = kc.init(chartRef.value!, {
    customApi: {
      formatDate: makeFormatDate(klocal.period.timespan)
    }
  })
  if(main.chart){
    initChart(main.chart)
  }
})

function initChart(chartObj: Chart){
  const watermarkContainer = chartObj.getDom('candle_pane', DomPosition.Main)
  if (watermarkContainer && watermark.value) {
    let elt = document.createElement('div')
    elt.className = 'klinecharts-pro-watermark'
    if (kc.utils.isString(watermark.value)) {
      const str = (watermark.value as string).replace(/(^\s*)|(\s*$)/g, '')
      elt.innerHTML = str
    } else {
      elt.appendChild(watermark.value as Node)
    }
    watermarkContainer.appendChild(elt)
  }
  const priceUnitContainer = chartObj.getDom('candle_pane', DomPosition.YAxis)
  priceUnitDom = document.createElement('span')
  priceUnitDom.className = 'klinecharts-pro-price-unit'
  priceUnitContainer?.appendChild(priceUnitDom)

  main.chart?.setTimezone(klocal.timezone)

  klocal.save_inds.forEach(ind => {
    const res = createIndicator(chartObj, ind.name, ind.params, true, {id: ind.pane_id})
  })
  const styles = toRaw(klocal.chartStyle)
  _.merge(styles, getDefStyles(t))
  _.merge(styles, getThemeStyles(klocal.theme))
  chartObj.setStyles(styles as Styles)

  chartObj.loadMore(timestamp => {
    const [to] = adjustFromTo(klocal.period, timestamp!, 1)
    const [from] = adjustFromTo(klocal.period, to, batch_num.value)
    loadKlineData(from, to)
  })

  chartObj.subscribeAction(ActionType.OnTooltipIconClick, data => {
    if (data.indicatorName) {
      switch (data.iconId) {
        case 'visible': {
          chartObj.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId)
          break
        }
        case 'invisible': {
          chartObj.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId)
          break
        }
        case 'setting': {
          main.editIndName = data.indicatorName
          main.editPaneId = data.paneId
          main.modalIndCfg = true
          break
        }
        case 'close': {
          const is_main = data.paneId == 'candle_pane'
          setIndicator({is_main, ind_name: data.indicatorName, is_add: false})
        }
      }
    }
  })

  if(!props.customLoad){
    // 自动加载K线
    loadSymbolPeriod(true, false)
  }
}

onUnmounted(() => {
  window.removeEventListener('resize', documentResize)
  if(chartRef.value){
    kc.dispose(chartRef.value!)
  }
})

async function loadKlineRange(symbol: SymbolInfo, period: Period, start_ms: number, stop_ms: number,
                              loadMore: boolean = true) {
  if (!main.chart) return
  loading = true
  main.loadingChart = true
  const chartObj: Chart = main.chart!;
  const strategy = route.query.strategy?.toString()
  const kdata = await datafeed.getHistoryKLineData({
    symbol, period, from: start_ms, to: stop_ms, strategy
  })
  const klines = kdata.data
  if (klines.length > 0) {
    const pricePrec = GetNumberDotOffset(Math.min(klines[0].low, klines[klines.length - 1].low)) + 3
    chartObj.setPriceVolumePrecision(pricePrec, 0)
  }
  const hasMore = loadMore && klines.length > 0;
  chartObj.applyNewData(klines, hasMore)
  kdata.lays?.forEach(o => {
    drawBarRef.value?.addOverlay(o)
  })
  loading = false
  main.loadingChart = false
  // 触发K线加载完毕事件
  main.klineLoaded += 1
  if (klines.length) {
    tf_msecs = tf_to_secs(period.timeframe) * 1000
    const curTime = new Date().getTime()
    const stop_ms = klines[klines.length - 1].timestamp + tf_msecs
    if (stop_ms + tf_msecs > curTime) {
      // 加载的是最新的bar，则自动开启websocket监听
      datafeed.subscribe(symbol, period, result => {
        const kline = chartObj.getDataList()
        const last = kline[kline.length - 1]
        const lastBar: BarArr | null = last && last.timestamp ? [
          last.timestamp, last.open, last.high, last.low, last.close, last.volume ?? 0
        ] : null
        const ohlcvArr = build_ohlcvs(result.bars, result.secs * 1000, tf_msecs, lastBar)
        addChartBars(chartObj, ohlcvArr.map(row => {
          return {
            timestamp: row[0],
            open: row[1],
            high: row[2],
            low: row[3],
            close: row[4],
            volume: row[5]
          }
        }))
      })
    }
  }
}

/**
 * 根据输入的参数，自定义加载K线数据
 */
async function customLoadKline(){
  const start_ms = toUTCStamp(klocal.dt_start)
  let stop_ms = toUTCStamp(klocal.dt_stop)
  if(!start_ms || !stop_ms){
    ElMessageBox.alert('时间无效，请使用：202301011200')
    return;
  }
  tf_msecs = tf_to_secs(klocal.period.timeframe) * 1000
  const totalNum = (stop_ms - start_ms) / tf_msecs;
  if(totalNum > defaults.maxBarNum){
    stop_ms = start_ms + tf_msecs * defaults.maxBarNum;
    const stop_str = getDateStr(stop_ms)
    ElMessage({
      message: `长度${totalNum}, 已截取${defaults.maxBarNum}, 截止时间：${stop_str}`,
      type: 'warning',
      duration: 2000
    })
  }
  await loadKlineRange(klocal.symbol, klocal.period, start_ms, stop_ms, false)
  main.fireKRange += 1
}

function loadSymbolPeriod(symbol_chg: boolean, period_chg: boolean){
  const s = klocal.symbol
  const p = klocal.period
  const curTime = new Date().getTime()
  const [from, to] = adjustFromTo(p, curTime, batch_num.value)
  loadKlineRange(s, p, from, curTime, !props.customLoad)
}

// 监听周期变化
watch(klocal.period, (new_period, prev_period) => {
  main.chart?.setCustomApi({
    formatDate: makeFormatDate(klocal.period.timespan)
  })
  if (loading || props.customLoad) return
  // 手动加载模式下，不监听币种和周期变化自动加载。
  loadSymbolPeriod(false, true)
})

function updateSymbolPriceUnit(new_val: SymbolInfo) {
  if (!priceUnitDom) return
  if (new_val.priceCurrency) {
    priceUnitDom.innerHTML = new_val.priceCurrency.toLocaleUpperCase()
    priceUnitDom.style.display = 'flex'
  } else {
    priceUnitDom.style.display = 'none'
  }
}

// 监听币种变化
watch(klocal.symbol, (new_symbol, prev_symbol) => {
  updateSymbolPriceUnit(new_symbol)
  if (loading || props.customLoad) return
  // 手动加载模式下，不监听币种和周期变化自动加载。
  datafeed.unsubscribe(prev_symbol!, klocal.period)
  loadSymbolPeriod(true, false)
})

// 监听币种变化
watch(klocal.period, (new_period, prev_period) => {
  if (loading || props.customLoad) return
  // 手动加载模式下，不监听币种和周期变化自动加载。
  datafeed.unsubscribe(klocal.symbol, klocal.period)
  loadSymbolPeriod(false, true)
})

// 监听主题变化
watch(() => klocal.theme, (new_val) => {
  // 加载新指标时，修改默认颜色
  if(new_val == 'light'){
    main.color_long = 'green'
    main.color_short = 'red'
  }
  else{
    main.color_long = 'green'
    main.color_short = 'rgb(255,135,8)'
  }
  main.chart?.setStyles(getThemeStyles(new_val))
})

// 监听时区变化
watch(() => klocal.timezone, (new_val) => {
  main.chart?.setTimezone(new_val)
})

// 监听右侧边栏显示
watch(() => klocal.showRight, () => {
  setTimeout(() => {
    documentResize()
  }, 50)
})

// 监听数据加载动作
watch(() => main.fireOhlcv, async () => {
  if(main.start_ms && main.stop_ms){
    await loadKlineRange(klocal.symbol, klocal.period, main.start_ms, main.stop_ms)
    main.start_ms = 0
    main.stop_ms = 0
  }
  else{
    await customLoadKline()
  }
})
</script>

<template>
  <div class="kline-body klinecharts-pro" :data-theme="klocal.theme">
    <i class="icon-close klinecharts-pro-load-icon"/>
    <div class="kline-main" :data-right="klocal.showRight">
      <KlineMenuBar :has-right="hasRight" :custom-load="customLoad"
        @loadData="customLoadKline"/>
      <div class="klinecharts-pro-content">
        <KlineLoading v-if="main.loadingChart"/>
        <KlineDrawBar ref="drawBarRef" v-if="main.showDrawBar"/>
        <div ref="chartRef" class='klinecharts-pro-widget' :data-has-left="main.showDrawBar"
           @keydown.delete="drawBarRef.clickRemove()"/>
      </div>
    </div>
    <slot/>
  </div>
</template>

<style lang="scss">
@import "~/assets/klinebase.scss";
@import '~/assets/klinefont.css';
body{
  margin: 0;
  min-height: 100vh;
}
#__nuxt{
  height: 100vh;
}
.#{$prefix-cls}{
  height: 100%;
}
.kline-body{
  height: 100%;
  width: 100%;
  .kline-main{
    flex-grow: 1;
    width: 100%;
    &[data-right=true]{
      width: calc(100% - var(--c-aside-width));
    }
  }
}
.kline-slide{
  height: 100%;
  overflow: hidden;
  width: var(--c-aside-width);
  display: flex;
  flex-direction: column;
}

.#{$prefix-cls} {
  --klinecharts-pro-primary-color: #{$c-primary};
  --klinecharts-pro-hover-background-color: #{$c-hover-background-light};
  --klinecharts-pro-background-color: #{$c-background-light};
  --klinecharts-pro-popover-background-color: #{$c-popover-background-light};
  --klinecharts-pro-text-color: #{$c-text-light};
  --klinecharts-pro-text-second-color: #{$c-text-second-light};
  --klinecharts-pro-border-color: #{$c-border-light};
  --klinecharts-pro-selected-color: fade(#{ $c-primary }, 15%);
  &[data-theme="dark"] {
    --klinecharts-pro-hover-background-color: #{$c-hover-background-dark};
    --klinecharts-pro-background-color: #{$c-background-dark};
    --klinecharts-pro-popover-background-color: #{$c-popover-background-dark};
    --klinecharts-pro-text-color: #{$c-text-dark};
    --klinecharts-pro-text-second-color: #{$c-text-second-dark};
    --klinecharts-pro-border-color: #{$c-border-dark};
  }
  position: relative;
  display: flex;
  flex-direction: row;
  color: var(--klinecharts-pro-text-color);
  background-color: var(--klinecharts-pro-background-color);
  font-size: 14px;
  height: 100vh;
  width: 100%;
  &-watermark {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 1;
    transform: translateX(-50%) translateY(-50%);
    .logo {
      width: 160px;
      height: 184px;
      fill: var(--klinecharts-pro-border-color);
    }
  }
  &-price-unit {
    display: none;
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 30;
    top: 4px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 4px;
    font-size: 10px;
    font-weight: bold;
    padding: 1px 4px;
    color: var(--klinecharts-pro-text-second-color);
    box-shadow: 0 3px 3px 0 rgba(50, 50, 50, .3);
    border: solid 1px var(--klinecharts-pro-border-color);
    background-color: var(--klinecharts-pro-background-color);
  }
  &-load-icon {
    position: absolute;
    left: 0;
    height: 0;
    z-index: -1;
    opacity: 0;
  }
  &-content {
    position: relative;
    display: flex;
    flex-direction: row;
    width: 100%;
    height: $widget-height;
  }
  &-widget {
    width: $widget-width;
    height: 100%;
    margin-left: 0;
    overflow: hidden;
    &[data-has-left="false"] {
      width: 100%;
    }
  }
}
</style>

