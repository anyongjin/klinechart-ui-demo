import {type Period, type SymbolInfo} from "~/composables/types";
import {type CandleTooltipCustomCallbackData, type CandleStyle} from "klinecharts";
import kc from "klinecharts";
import {tf_to_secs, formatDate} from "~/composables/dateutil";
import {useKlineStore} from "~/stores/kline";
import {ref} from "#imports";
import {type BarArr} from "~/composables/types";
import {getDefaults} from "~/config";

export const formatPrecision = kc.utils.formatPrecision
export const formatThousands = kc.utils.formatThousands
export const formatBigNumber = kc.utils.formatBigNumber
const TooltipIconPosition = kc.TooltipIconPosition

const _periods: Record<string, Period> = {}
const defaults = getDefaults()


export function GetNumberDotOffset(value: number){
  value = Math.abs(value)
  if(value >= 1)return 0
  let count = 0;
  while (value < 1){
    value = value * 10;
    count += 1;
  }
  return count;
}

export function makePeriod(timeframe: string): Period {
  if (_periods[timeframe]) return _periods[timeframe]
  const sep_id = timeframe.length - 1
  const unit = timeframe.substring(sep_id);
  const num = timeframe.substring(0, sep_id);
  const num_val = parseInt(num);
  let timespan = 'minute';
  if (unit == 'w') {
    timespan = 'week'
  } else if (unit == 'd') {
    timespan = 'day'
  } else if (unit == 'h') {
    timespan = 'hour'
  } else if (unit == 'm') {
    timespan = 'minute'
  } else {
    throw new Error(`unsupport period: ${timeframe}`)
  }
  let text = timeframe
  if (unit != 'm') {
    text = `${num}${unit.toUpperCase()}`
  }
  const secs = tf_to_secs(timeframe)
  _periods[timeframe] = {multiplier: num_val, timespan, text, timeframe, secs}
  return _periods[timeframe]
}

export const AllPeriods: Period[] = [
  makePeriod('1m'),
  makePeriod('5m'),
  makePeriod('15m'),
  makePeriod('1h'),
  makePeriod('2h'),
  makePeriod('4h'),
  makePeriod('1d'),
  makePeriod('3d'),
  makePeriod('1w'),
]

function buildDateTimeFormat (timezone?: string): Intl.DateTimeFormat | null {
  const options: Intl.DateTimeFormatOptions = {
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }
  if (timezone !== undefined) {
    options.timeZone = timezone
  }
  let dateTimeFormat: Intl.DateTimeFormat | null = null
  try {
    dateTimeFormat = new Intl.DateTimeFormat('en', options)
  } catch (e) {
    console.error('', '', 'Timezone is error!!!')
  }
  return dateTimeFormat
}

const dateTimeFormat = buildDateTimeFormat()
export type Translate = (input: string) => string;

function makeCandleTooltipCustom(t: Translate) {
  function CandleTooltipCustom(data: CandleTooltipCustomCallbackData, styles: CandleStyle) {
    const defVal = styles.tooltip.defaultValue
    const current = data.current
    const prevClose = data.prev?.close ?? current.close
    const changeValue = current.close - prevClose
    const thousandsSeparator = ','
    const clow = data.current.low
    const minProce = Math.min(clow, data.prev?.low ?? clow, data.next?.low ?? clow)
    const pricePrecision = GetNumberDotOffset(minProce) + 2
    const volumePrecision = 3

    const volPrecision = formatPrecision(current.volume ?? defVal, volumePrecision)
    const volume = formatThousands(formatBigNumber(volPrecision), thousandsSeparator)
    const change = prevClose === 0 ? defVal : `${formatPrecision(changeValue / prevClose * 100)}%`
    return [
      {title: t('time_'), value: formatDate(dateTimeFormat!, current.timestamp, 'YYYY-MM-DD HH:mm')},
      {title: t('open_'), value: formatThousands(formatPrecision(current.open, pricePrecision), thousandsSeparator)},
      {title: t('high_'), value: formatThousands(formatPrecision(current.high, pricePrecision), thousandsSeparator)},
      {title: t('low_'), value: formatThousands(formatPrecision(current.low, pricePrecision), thousandsSeparator)},
      {title: t('close_'), value: formatThousands(formatPrecision(current.close, pricePrecision), thousandsSeparator)},
      {title: t('volume_'), value: volume},
      {title: t('change_'), value: change}
    ]
  }
  return CandleTooltipCustom
}

export function getDefStyles(t: Translate) {
  return {
    candle: {
      tooltip: {
        custom: makeCandleTooltipCustom(t)
      }
    },
  }
}


export function isNumber (value: any): value is number {
  return typeof value === 'number' && !isNaN(value)
}

export function readableNumber (value: string | number, keepLen=2): string {
  const v = +value
  if (isNumber(v)) {
    if (v > 1000000000) {
      return `${+((v / 1000000000).toFixed(keepLen))}B`
    }
    if (v > 1000000) {
      return `${+((v / 1000000).toFixed(keepLen))}M`
    }
    if (v > 1000) {
      return `${+((v / 1000).toFixed(keepLen))}K`
    }
  }
  return `${value}`
}


function getIconTool(id: string, icon: string, color: string, ){
  return{
    id,
    position: TooltipIconPosition.Middle,
    marginLeft: 8,
    marginTop: 7,
    marginRight: 0,
    marginBottom: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    icon,
    fontFamily: 'icomoon',
    size: 14,
    color: color,
    activeColor: color,
    backgroundColor: 'transparent',
    activeBackgroundColor: 'rgba(22, 119, 255, 0.15)'
  }
}

export function getThemeStyles(theme: string) {
  const color = theme === 'dark' ? '#929AA5' : '#76808F'
  const lineColor = theme === 'dark' ? '#555555' : '#dddddd'
  return {
    grid:{
      horizontal:{
        color: lineColor
      },
      vertical:{
        color: lineColor
      }
    },
    indicator: {
      tooltip: {
        icons: [
          getIconTool('visible', '\ue903', color),
          getIconTool('invisible', '\ue901', color),
          getIconTool('setting', '\ue902', color),
          getIconTool('close', '\ue900', color),
        ]
      }
    }
  }
}


export function build_ohlcvs(details: BarArr[], in_msecs: number, tf_msecs: number, last_bar: BarArr | null = null): BarArr[] {
  if(last_bar){
    last_bar[0] = Math.floor(last_bar[0] / tf_msecs) * tf_msecs
  }
  if(in_msecs == tf_msecs){
    if(last_bar && details[0][0] > last_bar[0]){
      details.splice(0, 0, last_bar)
    }
    return details
  }
  const result: BarArr[] = last_bar ? [last_bar] : []
  let lastIdx = result.length - 1
  details.forEach((row: BarArr, index: number) => {
    row[0] = Math.floor(row[0] / tf_msecs) * tf_msecs
    if(lastIdx < 0 || row[0] > result[lastIdx][0]){
      result.push(row)
      lastIdx += 1
    }
    else{
      const prow = result[lastIdx]
      prow[2] = Math.max(prow[2], row[2])
      prow[3] = Math.min(prow[3], row[3])
      prow[4] = row[4]
      prow[5] += row[5]
    }
  })
  return result
}

/**
 * 自定义K线相关的共享对象。
 * 这些对象放在pinia的store中会报错，故使用use在多个组件间共享。
 */
export function useKlineObjs(){
  const datafeed = reactive(new defaults.Datafeed())

  return {datafeed}
}

export function useSymbols() {
  const main = useKlineStore()
  const {datafeed} = useKlineObjs()

  function loadSymbols() {
    if (main.pairs_loading || main.all_symbols.length > 0) return
    main.pairs_loading = true
    main.pairs_error = ''
    datafeed.getSymbols().then(res => {
      main.all_symbols.splice(0, main.all_symbols.length, ...res)
      main.pairs_loading = false
    })
      .catch(err => {
        main.pairs_error = err
        main.pairs_loading = false
      })
  }

  async function searchSymbols(keyword: string) {
    if (main.pairs_loading) return
    main.pairs_loading = true
    main.pairs_error = ''
    try {
      const res = await datafeed.searchSymbols(keyword)
      main.cur_symbols.splice(0, main.cur_symbols.length, ...res)
      main.pairs_loading = false
    } catch (err) {
      main.pairs_error = JSON.stringify(err)
      main.pairs_loading = false
    }
  }

  return {loadSymbols, searchSymbols}
}