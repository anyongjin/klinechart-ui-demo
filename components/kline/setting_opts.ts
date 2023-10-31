
export function getOptions () {
  return [
    {
      key: 'candle.type',
      text: 'candle_type',
      component: 'select',
      dataSource: [
        { key: 'candle_solid', text: 'candle_solid' },
        { key: 'candle_stroke', text: 'candle_stroke' },
        { key: 'candle_up_stroke', text: 'candle_up_stroke' },
        { key: 'candle_down_stroke', text: 'candle_down_stroke' },
        { key: 'ohlc', text: 'ohlc' },
        { key: 'area', text: 'area' }
      ]
    },
    {
      key: 'candle.priceMark.last.show',
      text: 'last_price_show',
      component: 'switch'
    },
    {
      key: 'candle.priceMark.high.show',
      text: 'high_price_show',
      component: 'switch'
    },
    {
      key: 'candle.priceMark.low.show',
      text: 'low_price_show',
      component: 'switch'
    },
    {
      key: 'indicator.lastValueMark.show',
      text: 'indicator_last_value_show',
      component: 'switch'
    },
    {
      key: 'yAxis.type',
      text: 'price_axis_type',
      component: 'select',
      dataSource: [
        { key: 'normal', text: 'normal' },
        { key: 'percentage', text: 'percentage' },
        { key: 'log', text: 'log' }
      ],
    },
    {
      key: 'yAxis.reverse',
      text: 'reverse_coordinate',
      component: 'switch',
    },
    {
      key: 'grid.show',
      text: 'grid_show',
      component: 'switch',
    }
  ]
}
