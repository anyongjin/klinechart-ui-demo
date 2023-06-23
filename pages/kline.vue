<template>
  <KLineCharPro ref="chart" :datafeed="datafeed"/>
</template>

<script setup lang="ts">
import KLineCharPro from "~/components/kline/chart_pro.vue"
import BanDatafeed from "~/composables/kline/ban_datafeed"
import {ref} from "vue"

const datafeed = ref(new BanDatafeed())

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