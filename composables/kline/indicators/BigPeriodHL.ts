import type {IndicatorTemplate} from "klinecharts";
import kc from "klinecharts";
import type {Datafeed} from "~/composables/kline/datafeeds";
import {useKlineLocal} from "~/stores/klineLocal";
import {makePeriod} from "~/composables/kline/coms";
import { build_ohlcvs } from "~/composables/kline/coms";
const LineType = kc.LineType;


const bigPeriodHL: IndicatorTemplate = {
  name: 'BigPeriodHL',
  extendData: 'datafeed',
  figures: [
    //{key: 'o', title: '开盘：', type: 'line'},
    {key: 'c', title: '节奏A：', type: 'line'},
    {key: 'm', title: '节奏B：', type: 'line'},
    {key: 'f2cl', title: '突A：', type: 'line'},
    {key: 'f1cl', title: '突B：', type: 'line'},
    {key: 'f1ch', title: '修？', type: 'line'},
    // {key: 'f2ch', title: 'f1ch：', type: 'line'},
  ],
  styles: {
    lines: [
      {
        // 'solid' | 'dashed'
        style: LineType.Dashed,
        smooth: false,
        size: 2,
        dashedValue: [2, 2],
        color: '#feae00'
      }, {
        style: LineType.Solid,
        smooth: false,
        size: 2,
        dashedValue: [2, 2],
        color: '#fa9c06'
      }, {
        style: LineType.Dashed,
        smooth: false,
        size: 1,
        dashedValue: [2, 2],
        color: 'rgba(23,0,230,0.54)'
      }, {
        style: LineType.Dashed,
        smooth: false,
        size: 1,
        dashedValue: [2, 2],
        color: '#001be6'
      }, {
        style: LineType.Solid,
        smooth: false,
        size: 4,
        dashedValue: [2, 2],
        color: '#1700e6'
      }
    ],
  },
  calc: async (dataList, {name, calcParams, extendData}) => {
    if (!dataList.length) return []
    const feed = extendData as Datafeed;
    const klocal = useKlineLocal()
    const symbol = klocal.symbol
    const period = makePeriod('1w')
    const res_period = makePeriod('3w')
    const to = dataList[dataList.length - 1].timestamp
    const tf_msecs = res_period.secs * 1000
    const from = dataList[0].timestamp - tf_msecs * 3
    const rsp = await feed.getHistoryKLineData({symbol, period, from, to})
    if (!rsp || !rsp.data || !rsp.data.length) {
      console.error('request kline fail:', symbol.ticker, period.timeframe, from, to, rsp)
      return []
    }
    const bar_arr = rsp.data.map(it => [it.timestamp, it.open, it.high, it.low, it.close, it.volume] as BarArr)
    const big_bars = build_ohlcvs(bar_arr, period.secs * 1000, tf_msecs)
    const bigs = big_bars.map((data: any) => ({
      timestamp: data[0],
      open: data[1],
      high: data[2],
      low: data[3],
      close: data[4],
      volume: data[5]
    }))
    const result: Record<string, number>[] = []
    let bigid = 0;
    let big = bigs[bigid]
    let big_from = big.timestamp + tf_msecs // 此大周期对应bar的开始时间戳
    let big_to = big_from + tf_msecs  // 此大周期对应bar的结束时间戳
    let range = big.high - big.low
    let big_item = {
      o: big.open,
      h: big.high,
      l: big.low,
      c: big.close,
      m: (big.open + big.close) / 2,
      f1ch: big.high - range * 0.8,
      f2ch: big.high - range,
      f1cl: big.low + range * 0.8,
      f2cl: big.low + range
    }
    for(let bar of dataList){
      while(bar.timestamp >= big_to){
        bigid += 1;
        if(bigs.length <= bigid){
          // 没有大周期了，直接返回
          return result
        }
        big = bigs[bigid]
        big_from = big.timestamp + tf_msecs // 此大周期对应bar的开始时间戳
        big_to = big_from + tf_msecs  // 此大周期对应bar的结束时间戳
        range = big.high - big.low
        big_item = {
          o: big.open,
          h: big.high,
          l: big.low,
          c: big.close,
          m: (big.open + big.close) / 2,
          f1ch: big.high - range * 0.8,
          f2ch: big.high - range,
          f1cl: big.low + range * 0.8,
          f2cl: big.low + range
        }
      }
      result.push(big_item)
    }
    return result
  }
}

export default bigPeriodHL
