import {defineStore } from "pinia";
import {ref} from "#imports";
import {type BanInd} from "~/composables/types";
import {type Chart, type Nullable} from "klinecharts";
import {type SymbolInfo} from "~/composables/types";
import {getDefaults} from "~/config";


export const useKlineStore = defineStore('kline', () => {
  const showLogin = ref(false)
  const showDrawBar = ref(true)
  const modalIndCfg = ref(false)
  const editPaneId = ref('')
  const editIndName = ref('')
  const authTFList = reactive(['1m', '5m', '15m', '1h', '2h', '4h', '1d'])
  // 触发K线数据加载。
  const fireOhlcv = ref(1)
  const start_ms = ref(0)
  const stop_ms = ref(0)
  // 用户设置K线范围时触发
  const fireKRange = ref(1)
  // K线加载完毕时触发
  const klineLoaded = ref(1)
  const chart = ref<Nullable<Chart>>(null)
  const loadingChart = ref(false)

  // 限制只能查看这些symbols
  const cur_symbols = reactive<SymbolInfo[]>([])
  const all_symbols = reactive<SymbolInfo[]>([])
  const pairs_loading = ref(false)
  const pairs_error = ref<string>('')

  const color_short = ref('red')
  const color_long = ref('green')

  const local_mains = ['MA', 'EMA', 'SMA', 'BOLL', 'SAR', 'BBI', 'BigPeriodHL']
  const local_subs = ['VOL', 'MACD', 'KDJ', 'RSI', 'BIAS', 'BRAR',
    'CCI', 'DMI', 'CR', 'PSY', 'DMA', 'TRIX', 'OBV', 'VR', 'WR', 'MTM', 'EMV',
    'SAR', 'ROC', 'PVT', 'AO']

  // 所有的指标列表
  const all_inds = reactive<BanInd[]>([])
  for(let name of local_mains){
    all_inds.push({name, title: name.toLowerCase(), cloud: false, is_main: true})
  }
  for(let name of local_subs){
    all_inds.push({name, title: name.toLowerCase(), cloud: false, is_main: false})
  }

  function setCurSymbols(pairs: string[]){
    const defs = getDefaults()
    cur_symbols.splice(0, cur_symbols.length)
    pairs.forEach(pair => {
      cur_symbols.push({
        ...defs.symbol,
        ticker: pair,
        name: pair,
        shortName: pair
      })
    })
  }

  const symbols = computed(() => {
    return cur_symbols.length ? cur_symbols : all_symbols
  })

  return {chart, loadingChart, showLogin, showDrawBar, modalIndCfg, editPaneId, editIndName, authTFList,
    fireOhlcv, start_ms, stop_ms, fireKRange, klineLoaded, all_inds, cur_symbols, all_symbols, setCurSymbols,
    color_short, color_long, pairs_loading, pairs_error, symbols
  }
})