<template>
  <div class="klinecharts-pro">
    <i class="icon-close klinecharts-pro-load-icon"/>
    <KlineSymbolModal v-model="showSymbolModal" :datafeed="datafeed" @select="_symbol = $event"/>
    <KlineIndSearchModal v-model="showIndSearchModal" :panes="_panes" @change="setIndicator"/>
    <KlineSettingModal v-model="showSettingModal" :currentStyles="styles"
                       @change="setStyles" @reset="resetStyle"/>
    <KlineScreenshotModal v-model="showScreenShotModal" :url="screenShotUrl" @close="screenShotUrl = ''"/>
    <KlineIndCfgModal v-model="showIndCfgModal" :chart="chart" :ind-name="indCfg.ind_name" :pane-id="indCfg.paneId"/>
    <KlinePeriodBar :spread="showDrawingBar" :symbol="_symbol" :period="_period" :periods="periods"
        @clickSymbol="showSymbolModal = true" @clickPeriod="Object.assign(_period, _periods[$event])"
        @clickMenu="showDrawingBar = !showDrawingBar" @clickInd="showIndSearchModal = true"
        @clickSetting="showSettingModal = true" @clickShot="clickScreenShot"/>
    <div class="klinecharts-pro-content">
      <Loading v-if="loadingChart"/>
      <KlineDrawBar :chart="chart" v-if="showDrawingBar"/>
      <div ref="chartRef" class='klinecharts-pro-widget' :data-drawing-bar-visible="showDrawingBar"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ActionType, Chart, DomPosition, FormatDateType, init, Nullable, PaneOptions, Styles, utils,
  Indicator, dispose, TooltipIconPosition, registerOverlay
} from 'klinecharts'
import _ from "lodash"

import {
  KlineDrawBar,
  KlineIndCfgModal,
  KlineIndSearchModal,
  KlinePeriodBar,
  KlineScreenshotModal,
  KlineSettingModal,
  KlineSymbolModal
} from "#components";

import {PaneInds, Period, SymbolInfo, Datafeed} from './types'
import {computed, defineProps, onMounted, onUnmounted, reactive, ref, toRaw, watchEffect} from "vue";
import Loading from "~/components/kline/loading.vue";
import {getDefStyles, getThemeStyles, adjustFromTo, makeFormatDate} from "~/composables/kline/coms";
import {def} from "@vue/shared";
import overlays from '~/composables/kline/overlays'

overlays.forEach(o => { registerOverlay(o) })

type Props = {
  theme?: string,
  symbol?: SymbolInfo,
  period?: Period,
  periods?: Period[],
  panes?: PaneInds[],
  styles?: Styles,
  datafeed: Datafeed
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'light',
  symbol: () => ({ticker: 'BTC/USDT', exchange: 'binance', market: 'spot'}),
  period: () => ({ multiplier: 5, timespan: 'minute', text: '5m', timeframe: '5m' }),
  periods: () => ([
    { multiplier: 1, timespan: 'minute', text: '1m', timeframe: '1m' },
    { multiplier: 5, timespan: 'minute', text: '5m', timeframe: '5m' },
    { multiplier: 15, timespan: 'minute', text: '15m', timeframe: '15m' },
    { multiplier: 1, timespan: 'hour', text: '1H', timeframe: '1h' },
    { multiplier: 2, timespan: 'hour', text: '2H', timeframe: '2h' },
    { multiplier: 4, timespan: 'hour', text: '4H', timeframe: '4h' },
    { multiplier: 1, timespan: 'day', text: 'D', timeframe: '1d' },
    // { multiplier: 1, timespan: 'week', text: 'W', timeframe: '1w' },
    // { multiplier: 1, timespan: 'month', text: 'M', timeframe: '1M' },
    // { multiplier: 1, timespan: 'year', text: 'Y', timeframe: '1y' }
  ]),
  panes: () => ([
      {name: 'candle_pane', inds: []},
      {name: 'pane1', inds: ['VOL']}
  ])
})


const showSymbolModal = ref(false)
const showIndSearchModal = ref(false)
const showSettingModal = ref(false)
const showScreenShotModal = ref(false)
const showIndCfgModal = ref(false)
const loadingChart = ref(false)
const showDrawingBar = ref(true)
const _symbol = ref<SymbolInfo>(props.symbol)
const chartRef = ref<HTMLElement>()
const chart = ref<Nullable<Chart>>(null)
const screenShotUrl = ref('')
const indCfg = reactive({ind_name: '', paneId: '', calcParams: [] as Array<any>})
const _panes = reactive(props.panes)
const _period = reactive(props.period)
const _periods = reactive(props.periods)
let priceUnitDom: HTMLElement
let loading = false

let cstyles = props.styles ?? chart.value?.getStyles();
let init_styles = getDefStyles()
let theme_styles = getThemeStyles(props.theme)
_.merge(init_styles, theme_styles)
if(cstyles) {
  _.merge(init_styles, cstyles)
}
const styles = reactive(init_styles)

function setIndicator(paneId: string, ind_name: string, is_add: boolean){
  if(!chart.value)return
  let matches = _panes.filter(i => i.name == paneId);
  let target = matches[0] ?? {name: paneId, inds: []};
  if(!matches.length && is_add){
    if(paneId == 'candle_pane'){
      _panes.unshift(target)
    }else{
      _panes.push(target)
    }
  }
  if(is_add){
    createIndicator(chart.value, ind_name, true, {id: paneId})
    if(!target.inds.includes(ind_name)){
      target.inds.push(ind_name)
    }
  }
  else{
    chart.value?.removeIndicator(paneId, ind_name)
    let index = target.inds.indexOf(ind_name)
    if(index >= 0){
      target.inds.splice(index, 1)
    }
  }
}

function createIndicator (widget: Nullable<Chart>, indicatorName: string, isStack?: boolean, paneOptions?: PaneOptions): Nullable<string> {
  if (indicatorName === 'VOL') {
    paneOptions = { gap: { bottom: 2 }, ...paneOptions }
  }
  return widget?.createIndicator({
    name: indicatorName,
    // @ts-expect-error
    createTooltipDataSource: ({ indicator, defaultStyles }) => {
      const icon_ids = [indicator.visible ? 1: 0, 2, 3];
      const icons = icon_ids.map(i => defaultStyles.tooltip.icons[i])
      return { icons }
    }
  }, isStack, paneOptions) ?? null
}

function setStyles(styles: Styles){
  chart.value?.setStyles(styles as Styles)
}

function resetStyle(){
  Object.assign(styles, getDefStyles())
  chart.value?.setStyles(styles as Styles)
}

function clickScreenShot(){
  let bgColor = props.theme === 'dark' ? '#151517' : '#ffffff'
  screenShotUrl.value = chart.value?.getConvertPictureUrl(true, 'jpeg', bgColor) ?? ''
  showScreenShotModal.value = true
}

const documentResize = () => {
  chart.value?.resize()
}

onMounted(() => {
  window.addEventListener('resize', documentResize)
  chart.value = init(chartRef.value!, {
    customApi: {
      formatDate: makeFormatDate(_period.timespan)
    }
  })
  if (chart) {
    const priceUnitContainer = chart.value?.getDom('candle_pane', DomPosition.YAxis)
    priceUnitDom = document.createElement('span')
    priceUnitDom.className = 'klinecharts-pro-price-unit'
    priceUnitContainer?.appendChild(priceUnitDom)
  }

  _panes.forEach(pane => {
    pane.inds.forEach(ind => {
      createIndicator(chart.value, ind, true, {id: pane.name})
    })
  })

  chart.value?.setStyles(styles as Styles)

  chart.value?.loadMore(timestamp => {
    loading = true
    const get = async () => {
      const [to] = adjustFromTo(_period, timestamp!, 1)
      const [from] = adjustFromTo(_period, to, 500)
      const kLineDataList = await props.datafeed.getHistoryKLineData(_symbol.value, _period, from, to)
      chart.value?.applyMoreData(kLineDataList, kLineDataList.length > 0)
      loading = false
    }
    get()
  })

  chart.value?.subscribeAction(ActionType.OnTooltipIconClick, data => {
    if (data.indicatorName) {
      switch (data.iconId) {
        case 'visible': {
          chart.value?.overrideIndicator({ name: data.indicatorName, visible: true }, data.paneId)
          break
        }
        case 'invisible': {
          chart.value?.overrideIndicator({ name: data.indicatorName, visible: false }, data.paneId)
          break
        }
        case 'setting': {
          const indicator = chart.value?.getIndicatorByPaneId(data.paneId, data.indicatorName) as Indicator
          indCfg.ind_name = data.indicatorName
          indCfg.paneId = data.paneId
          indCfg.calcParams = indicator.calcParams
          showIndCfgModal.value = true
          break
        }
        case 'close': {
          console.log('close tootip:', data)
        }
      }
    }
  })

})

onUnmounted(() => {
  window.removeEventListener('resize', documentResize)
  if(chartRef.value){
    dispose(chartRef.value!)
  }
})

watchEffect(() => {
  if(!priceUnitDom)return
  const s = _symbol.value
  if (s?.priceCurrency) {
    priceUnitDom.innerHTML = s?.priceCurrency.toLocaleUpperCase()
    priceUnitDom.style.display = 'flex'
  } else {
    priceUnitDom.style.display = 'none'
  }
  chart.value?.setPriceVolumePrecision(s?.pricePrecision ?? 2, s?.volumePrecision ?? 0)
})

watch([_period, _symbol], ([period, symbol], [prev_period, prev_symbol]) => {
  if (!loading) {
    if (prev_period) {
      props.datafeed.unsubscribe(prev_symbol!, prev_period)
    }
    const s = symbol!
    const p = period!
    loading = true
    loadingChart.value = true
    const get = async () => {
      const [from, to] = adjustFromTo(p, new Date().getTime(), 500)
      const kLineDataList = await props.datafeed.getHistoryKLineData(s, p, from, to)
      chart.value?.applyNewData(kLineDataList, kLineDataList.length > 0)
      props.datafeed.subscribe(s, p, data => {
        chart.value?.updateData(data)
      })
      loading = false
      loadingChart.value = false
    }
    get()
  }
}, {immediate: true})

watchEffect(() => {
  chart.value?.setStyles(getThemeStyles(props.theme))
})

</script>

<style lang="scss">
@import '~/assets/klinebase.scss';
@import '~/assets/klinefont.css';

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
  flex-direction: column;
  color: var(--klinecharts-pro-text-color);
  background-color: var(--klinecharts-pro-background-color);
  font-size: 14px;
  height: 80vh;
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
    &[data-drawing-bar-visible="false"] {
      width: 100%;
    }
  }
}

</style>