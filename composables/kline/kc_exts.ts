import {type Chart, type KLineData} from "klinecharts"
import kc from "klinecharts"
const formatValue = kc.utils.formatValue


/**
 * 向KlineChart最后追加蜡烛
 * 因chart.updateData每次更新未完成bar都会触发指标重新计算。故实现此方法。
 * Chart未暴露getChartStore方法，所以这里需要用any类型
 * @param chart
 * @param bar_arr
 */
export function addChartBars(chart: any, bar_arr: KLineData[]): void {
  if (!bar_arr.length) return
  const dataList = chart.getDataList()
  const store = chart.getChartStore()
  const curLast = dataList[dataList.length - 1];
  let last_ts = formatValue(curLast, 'timestamp', 0) as number
  bar_arr.forEach(bar => {
    const timestamp = bar.timestamp
    if (timestamp < last_ts) return
    const pos = timestamp === last_ts ? dataList.length - 1 : dataList.length;
    store.addData(bar, pos)
    last_ts = timestamp
  })
  chart.adjustPaneViewport(false, true, true, true)
}

