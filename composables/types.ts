
import {type KLineData, type Styles, type DeepPartial} from 'klinecharts'

export interface SymbolInfo {
  ticker: string
  name?: string
  shortName?: string
  exchange?: string
  market?: string
  pricePrecision?: number
  volumePrecision?: number
  priceCurrency?: string
  type?: string
  logo?: string
  title?: string
}

export interface Period {
  multiplier: number
  timespan: string
  text: string
  timeframe: string
  secs: number
}

export type PaneInds = {
  name: string,
  inds: string[]
}

export type KData = {
  data: KLineData[],
  lays?: any[]
}

export type DatafeedWatchCallback = (data: any) => void

export type GetKlineArgs = {
  symbol: SymbolInfo,
  period: Period,
  from: number,
  to: number,
  strategy?: string
}

export interface Datafeed {
  getSymbols (): Promise<SymbolInfo[]>
  searchSymbols (keyword: string): Promise<SymbolInfo[]>
  getHistoryKLineData (args: GetKlineArgs): Promise<KData>
  subscribe (symbol: SymbolInfo, period: Period, callback: DatafeedWatchCallback): void
  unsubscribe (symbol: SymbolInfo, period: Period): void
}

export interface ChartProOptions {
  container: string | HTMLElement
  styles?: DeepPartial<Styles>
  watermark?: string | Node
  theme?: string
  locale?: string
  drawingBarVisible?: boolean
  symbol: SymbolInfo
  period: Period
  periods?: Period[]
  timezone?: string
  mainIndicators?: string[]
  subIndicators?: string[]
  datafeed: Datafeed
}

export interface ChartPro {
  setTheme(theme: string): void
  getTheme(): string
  setStyles(styles: DeepPartial<Styles>): void
  getStyles(): Styles
  setLocale(locale: string): void
  getLocale(): string
  setTimezone(timezone: string): void
  getTimezone(): string
  setSymbol(symbol: SymbolInfo): void
  getSymbol(): SymbolInfo
  setPeriod(period: Period): void
  getPeriod(): Period
}

export type PairItem = {
  label: string,
  value: string
}

export type BanInd = {
  name: string,
  title: string,
  cloud: boolean,
  is_main: boolean
}

/**
 * 用于K线图表上显示的交易信息
 * time/price通过Point传入
 */
export interface TradeInfo {
  line_color: string,
  in_color: string,
  in_text: string,
  out_color: string,
  out_text: string,
  active?: boolean,
  selected?: boolean,
  distance?: number
}

export type BarArr = [number, number, number, number, number, number]

export type AddDelInd = {
  is_main: boolean,
  ind_name: string,
  is_add: boolean
}