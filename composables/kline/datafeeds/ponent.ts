import {$fetch} from "ofetch";
import {type Datafeed, type SymbolInfo, type Period, type DatafeedWatchCallback, type KData, type GetKlineArgs} from "~/composables/types";
import {getDefaults} from "~/config";
import {useKlineStore} from "#imports";
const defaults = getDefaults()
const data_url = defaults.data_url
const day_secs = tf_to_secs('1d')
const week_secs = tf_to_secs('1w')
const mon_secs = tf_to_secs('1M')

/**
 * ponentsoft的数据源
 *
 */
export default class PonentDatafeed implements Datafeed{

  /**
   * 传入的时间戳服务器端会转换为日期格式，没有严格使用时间戳，所以这里应确保取日期的开始结束时间戳
   * period: 1，5，10，15，30，60，120，1D， 1W， 1M
   * @param symbol
   * @param period
   * @param from
   * @param to
   */
  async getHistoryKLineData({symbol, period, from, to, strategy}: GetKlineArgs): Promise<KData> {
    const url = `${data_url}/app/bars`
    let fromts = Math.round(from / 1000)
    let tots = Math.round(to / 1000)
    tots = Math.round(tots / day_secs) * day_secs - 1
    let period_val = Math.round(period.secs / 60).toString()
    if(period.secs >= mon_secs){
      period_val = '1M'
    }
    else if(period.secs >= week_secs){
      period_val = '1W'
    }
    else if(period.secs >= day_secs){
      period_val = '1D'
    }
    const data = {"code":symbol.ticker ,fromts, tots,"count":1000,"period": period_val}
    const rsp = await $fetch(url, {
      method: 'POST',
      body: data,
      headers: {
        'Authorization': defaults.data_token
      }
    })
    if(rsp.status != 'ok'){
      throw new Error(JSON.stringify(rsp))
    }
    const bars = await (rsp.data || []).map((row: string) => {
      const arr = row.split(',')
      return {
        timestamp: parseInt(arr[0]) * 1000,
        open: parseFloat(arr[1]),
        high: parseFloat(arr[2]),
        low: parseFloat(arr[3]),
        close: parseFloat(arr[4]),
        volume: parseFloat(arr[5]),
      }
    })
    return {data: bars}
  }

  /**
   * coins/{id}/tickers  获取某个交易所，所有币基于某个定价币usdt的行情
   * @param search
   */
  async getSymbols(): Promise<SymbolInfo[]> {
    return []
  }

  async searchSymbols (keyword: string): Promise<SymbolInfo[]> {
    const url = `${data_url}/app/search`
    const main = useKlineStore()
    const headers: Record<string, any> = {'Authorization': defaults.data_token}
    const data = {value: keyword, exchange: main.exchange}
    const rsp = await $fetch(url, {body: data, headers})
    if (rsp.status != 'ok') {
      throw new Error(JSON.stringify(rsp))
    }
    return await (rsp.data || []).map((row: any) => ({
      ticker: row.ticker,
      name: row.full_name,
      shortName: row.symbol,
      market: row.type,
      exchange: row.exchange,
      title: row.description
    }))
  }

  subscribe(symbol: SymbolInfo, period: Period, callback: DatafeedWatchCallback): void {
  }

  unsubscribe(symbol: SymbolInfo, period: Period): void {
  }

}
