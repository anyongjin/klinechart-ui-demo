import i18n from "~/composables/i18n";
let t = i18n.global.t

export function getOptions () {
  return [
    {
      key: 'candle.type',
      text: t('candle_type'),
      component: 'select',
      dataSource: [
        { key: 'candle_solid', text: t('candle_solid') },
        { key: 'candle_stroke', text: t('candle_stroke') },
        { key: 'candle_up_stroke', text: t('candle_up_stroke') },
        { key: 'candle_down_stroke', text: t('candle_down_stroke') },
        { key: 'ohlc', text: t('ohlc') },
        { key: 'area', text: t('area') }
      ]
    },
    {
      key: 'candle.priceMark.last.show',
      text: t('last_price_show'),
      component: 'switch'
    },
    {
      key: 'candle.priceMark.high.show',
      text: t('high_price_show'),
      component: 'switch'
    },
    {
      key: 'candle.priceMark.low.show',
      text: t('low_price_show'),
      component: 'switch'
    },
    {
      key: 'indicator.lastValueMark.show',
      text: t('indicator_last_value_show'),
      component: 'switch'
    },
    {
      key: 'yAxis.type',
      text: t('price_axis_type'),
      component: 'select',
      dataSource: [
        { key: 'normal', text: t('normal') },
        { key: 'percentage', text: t('percentage') },
        { key: 'log', text: t('log') }
      ],
    },
    {
      key: 'yAxis.reverse',
      text: t('reverse_coordinate'),
      component: 'switch',
    },
    {
      key: 'grid.show',
      text: t('grid_show'),
      component: 'switch',
    }
  ]
}
