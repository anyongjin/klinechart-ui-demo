import {type Period, type SymbolInfo} from "~/composables/types";
import {CoingeckoDatafeed} from "~/composables/kline/datafeeds";

export const getDefaults = () => {
  return {
    //symbol: {shortName: 'BTC/USDT.P', ticker: 'BTC/USDT.P', exchange: 'binance'} as SymbolInfo,
    symbol: {shortName: 'ETH', name: 'ETH', ticker: 'ethereum', exchange: 'binance'} as SymbolInfo,
    Datafeed: CoingeckoDatafeed,
    period: { multiplier: 3, timespan: 'day', text: '3D', timeframe: '3d', secs: 259200 } as Period,
    maxBarNum: 5000
  }
}