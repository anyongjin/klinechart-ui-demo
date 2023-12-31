import {type IndicatorTemplate} from "klinecharts";
import {type Datafeed} from "~/composables/kline/datafeeds";
import {useKlineLocal} from "~/stores/klineLocal";
import {makePeriod} from "~/composables/kline/coms";


const bigPeriodHL: IndicatorTemplate = {
  name: 'BigPeriodHL',
  extendData: 'datafeed',
  figures: [
    {key: 'o', title: '多空分界：', type: 'line'},
    {key: 'c', title: '收盘价：', type: 'line'},
    //{key: 'm', title: '生命线：', type: 'line'},
    {key: 'f0ch', title: 'f0ch：', type: 'line'},
    {key: 'f1ch', title: 'f1ch：', type: 'line'},
    {key: 'f0cl', title: 'f0cl：', type: 'line'},
    {key: 'f1cl', title: 'f1cl：', type: 'line'},
  ],
  calc: async (dataList, {name, calcParams, extendData}) => {
    if(!dataList.length)return []
    const feed = extendData as Datafeed;
    const klocal = useKlineLocal()
    const symbol = klocal.symbol
    const period = makePeriod('1w')
    const to = dataList[dataList.length - 1].timestamp
    const tf_msecs = period.secs * 1000
    const from = dataList[0].timestamp - tf_msecs * 3
    const rsp = await feed.getHistoryKLineData({symbol, period, from, to})
    if(!rsp || !rsp.data || !rsp.data.length){
      console.error('request kline fail:', symbol.ticker, period.timeframe, from, to, rsp)
      return []
    }
    const bigs = rsp.data
    const result: Record<string, number>[] = []
    for(const big of bigs){
      const start = big.timestamp + tf_msecs
      const stop = start + tf_msecs
      const num = dataList.filter(v => v.timestamp >= start && v.timestamp < stop).length
      if(!num)continue
      const range = big.high - big.low
      const item = {
        o: big.open,
        h: big.high,
        l: big.low,
        c: big.close,
        m: (big.open + big.close) / 2,
        f0ch: big.high - range,
        f1ch: big.high + range,
        f0cl: big.low + range,
        f1cl: big.low - range
      }
      result.push(...Array(num).fill(item))
    }
    return result
  }
}

export default bigPeriodHL
