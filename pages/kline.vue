<template>
  <KLineCharPro ref="chart" :datafeed="datafeed" :watermark="watermark" :symbol="symbol" :periods="periods"/>
</template>

<script setup lang="ts">
import KLineCharPro from "~/components/kline/chart_pro.vue"
import {CoingeckoDatafeed} from "~/composables/kline/datafeeds"
import {reactive, ref} from "vue"

const watermark = ref('<img width="504" src="/logo.png"/>')

const datafeed = ref(new CoingeckoDatafeed())

const symbol = reactive(datafeed.value.getDefaultSymbol())
const periods = reactive(datafeed.value.getAllPeriods())


</script>

<style lang="scss">
@import "~/assets/klinebase.scss";
body{
  margin: 0;
  min-height: 100vh;
}
#__nuxt{
  height: 100vh;
}
.#{$prefix-cls}{
  height: 100%;
}
</style>