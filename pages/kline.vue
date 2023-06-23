<template>
  <KLineCharPro ref="chart" :datafeed="datafeed"/>
</template>

<script setup lang="ts">
import KLineCharPro from "~/components/kline/chart_pro.vue"
import DefaultDatafeed from "~/composables/kline/DefaultDatafeed"
import {ref} from "vue"

const apiKey = '[APIKey]'

const datafeed = ref(new DefaultDatafeed(apiKey))

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