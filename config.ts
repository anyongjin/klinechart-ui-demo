import {type Period, type SymbolInfo} from "~/composables/types";

export function getDefaults() {
  return {
    //symbol: {shortName: 'BTC/USDT.P', ticker: 'BTC/USDT.P', exchange: 'binance'} as SymbolInfo,
    //symbol: {shortName: 'ETH', name: 'ETH', ticker: 'ethereum', exchange: 'binance'} as SymbolInfo,
    symbol: {
      shortName: '601318',
      name: 'SH:601318',
      ticker: '601318.SH',
      exchange: 'SH',
      title: '中国平安'
    } as SymbolInfo,
    period: {multiplier: 1, timespan: 'day', text: '1D', timeframe: '1d', secs: 86400} as Period,
    maxBarNum: 5000,
    data_url: 'https://ponentsoft.com/api',
    // ponentsoft的验证token
    data_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoia2FucGFuLmNuIiwiaWF0IjoxNjk0ODMwMzM3fQ.w93IBiBpGz-xhxi4mRX2xxN8PXH-J_psif7ytt1YKl8'
  }
}
