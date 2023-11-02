import {defineStore} from "pinia";
import {persistedState, ref} from "#imports";
import {type Period, type SymbolInfo} from "~/composables/types";
import {reactive} from "vue";
import _ from "lodash";
import {getDefaults} from "~/config";
import {makePeriod, useSymbols} from "~/composables/kline/coms";

const defaults = getDefaults();

const red = '#F92855'
const green = '#2DC08E'

const alphaRed = 'rgba(249, 40, 85, .7)'
const alphaGreen = 'rgba(45, 192, 142, .7)'

const defStyle = {
    candle: {
        type: 'candle_solid',
        bar: {
            upColor: red,
            downColor: green,
            upBorderColor: red,
            downBorderColor: green,
            upWickColor: red,
            downWickColor: green
        },
        priceMark: {
            last:{
                show: true,
                upColor: red,
                downColor: green
            },
            high:{
                show: true,
                upColor: red,
                downColor: green
            },
            low: {
                show: true,
                upColor: red,
                downColor: green
            }
        }
    },
    indicator: {
        bars: {
            upColor: red,
            downColor: green
        },
        ohlc: {
            upColor: alphaRed,
            downColor: alphaGreen
        },
        lastValueMark: {
            show: false
        }
    },
    yAxis: {
        type: 'normal',
        reverse: false
    },
    grid: {
        show: false
    }
}

type SaveInd = {
    name: string,
    pane_id: string
    params?: any[]
}

export const useKlineLocal = defineStore('klocal', () => {
    const period = reactive<Period>(defaults.period)
    const symbol = reactive<SymbolInfo>(defaults.symbol)
    const chartStyle = reactive(defStyle)
    const save_inds = ref<SaveInd[]>([
        {name: 'VOL', pane_id: 'pane_VOL'}
    ])
    const showRight = ref(true)
    const dt_start = ref('20230801')
    const dt_stop = ref('20230820')
    const timezone = ref(Intl.DateTimeFormat().resolvedOptions().timeZone)
    const theme = ref('light')

    function setPeriod(val: Period){
        Object.assign(period, val)
    }
    function setTimeframe(timeframe: string){
        Object.assign(period, makePeriod(timeframe))
    }
    function setSymbol(val: SymbolInfo){
        Object.assign(symbol, val)
    }
    function setStyleItem(key: string, val: any){
        _.set(chartStyle, key, val)
    }
    function resetStyle(){
        Object.assign(chartStyle, defStyle)
    }

    function removeInd(paneId: string, name?: string) {
        const mat_idx = save_inds.value.findIndex(d =>
          d.pane_id == paneId && (!name || d.name == name))
        if(mat_idx < 0)return
        save_inds.value.splice(mat_idx, 1)
    }
    return {period, symbol, chartStyle, save_inds, showRight, dt_start, dt_stop,
        timezone, theme, setPeriod, setTimeframe, setSymbol,
        setStyleItem, resetStyle, removeInd}
}, {
    persist: {
        storage: persistedState.localStorage,
        // beforeRestore({store}){
        //     console.log('before restore', toRaw(store))
        // },
        // afterRestore({store}){
        //     console.log('after restore', toRaw(store))
        // },
        // debug: true
    }
})