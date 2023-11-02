import {$fetch} from "ofetch";
import {
  type Datafeed,
  type SymbolInfo,
  type Period,
  type DatafeedWatchCallback,
  type KData,
  type GetKlineArgs,
  type BarArr
} from "~/composables/types";
import {getDefaults} from "~/config";
import {useKlineStore} from "#imports";
const defaults = getDefaults()
const data_url = defaults.data_url
const day_secs = tf_to_secs('1d')
const week_secs = tf_to_secs('1w')
const mon_secs = tf_to_secs('1M')
import {io, Socket} from "socket.io-client"
import {Job} from "@vercel/nft/out/node-file-trace";

function getPeriodSecs(period: string){
  if(period == '1M')return 2592000;
  if(period == '1W')return 604800;
  if(period == '1D')return 86400;
  return parseInt(period) * 60
}

function getPeriodText(period: Period){
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
  return period_val
}


/**
 * ponentsoft的数据源
 *
 */
export default class PonentDatafeed implements Datafeed{

  private _ws?: Socket

  /**
   * 传入的时间戳服务器端会转换为日期格式（+8的），没有严格使用时间戳，所以这里应确保取日期的开始结束时间戳
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
    // 这个改为8个时区之前的
    tots = Math.round(tots / day_secs) * day_secs - 28801
    const period_val = getPeriodText(period)
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
    const data = {value: keyword, exchange: ""}
    const rsp = await $fetch(url, {
      method: 'POST',
      body: data,
      headers: {'Authorization': defaults.data_token}
    })
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
    this._ws?.disconnect()
    this._ws = io(`${defaults.socket_url}/chart`, {
      path: defaults.socket_path,
      transports: ['websocket', 'polling'],
      auth: {Authorization: defaults.data_token},
      forceNew: true,
    })
    let last_bar: BarArr | null = null;
    // 订阅数据
    const period_val = getPeriodText(period)
    let channel = `${symbol.ticker}~${period_val}`
    if (this._ws.connected) {
      this._ws.emit('subs', channel)
    } else {
      this._ws.on('connect', () => this._ws?.emit('subs', channel))
    }
    // 监听数据
    this._ws.on('bars', (data: any) => {
      let {code, period, minutes} = data
      if(!minutes || !minutes.length)return
      let bars: BarArr[] = []
      for (let row of minutes) {
        const time_ms = row[0] * 1000
        bars.push([time_ms, row[1], row[2], row[3], row[4], row[5]])
      }
      const first = bars[0] as BarArr
      if (last_bar && first[0] == last_bar[0]) {
        // 如果和上一个推送的bar时间戳相同，则认为是其更新，减去上一个的volume，避免调用方错误累加
        first[5] -= last_bar[5]
      }
      last_bar = bars[bars.length - 1]
      callback({
        bars: bars,
        secs: getPeriodSecs(period)
      })
    })
  }

  unsubscribe(symbol: SymbolInfo, period: Period): void {
    if(!this._ws)return
    const period_val = getPeriodText(period)
    let channel = `${symbol.ticker}~${period_val}`
    this._ws.emit('cancel', channel)
  }

}
