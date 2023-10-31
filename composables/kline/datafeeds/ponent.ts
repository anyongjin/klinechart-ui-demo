import {$fetch} from "ofetch";
import {type Datafeed, type SymbolInfo, type Period, type DatafeedWatchCallback, type KData, type GetKlineArgs} from "~/composables/types";
import {getDefaults} from "~/config";
import {useKlineStore} from "#imports";
const defaults = getDefaults()
const data_url = defaults.data_url

/**
 * ponentsoft的数据源
 *
 */
export default class PonentDatafeed implements Datafeed{

  /**
   * coins/{id}/ohlc  免费用户最小30m间隔，无历史数据
   * 1 - 2 days: 30 minutes
   * 3 - 30 days: 4 hours
   * 31 days and beyond: 4 days
   * @param symbol
   * @param period
   * @param from
   * @param to
   */
  async getHistoryKLineData({symbol, period, from, to, strategy}: GetKlineArgs): Promise<KData> {
    const url = `${data_url}/app/bars`
    const fromts = Math.round(from / 1000)
    const tots = Math.round(to / 1000)
    const mins = Math.round(period.secs / 60)
    const data = {"code":symbol.ticker ,fromts, tots,"count":1000,"period":mins}
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
        timestamp: parseInt(arr[0]),
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
