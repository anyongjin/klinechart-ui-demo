<template>
  <KlineChart :has-right="true"/>
</template>

<script setup lang="ts">
import {useKlineLocal} from "~/stores/klineLocal";
import {makePeriod, useSymbols} from "~/composables/kline/coms";
import {useKlineStore} from "~/stores/kline";
import {setTimezone} from "~/composables/dateutil";
const {exg, symbol, period, ind} = useRoute().query

const klocal = useKlineLocal()
const store = useKlineStore()
const {loadSymbols, searchSymbols} = useSymbols()
const queryLoaded = ref(false)


function loadQueryInds(){
  if(queryLoaded.value)return
  queryLoaded.value = true
  let ticker = klocal.symbol.ticker;
  if(typeof symbol === 'string' && symbol){
    ticker = symbol
  }
  let exchange = klocal.symbol.exchange
  if(typeof exg === 'string' && exg){
    exchange = exg
  }
  const mats = store.all_symbols.filter(
    s => s.exchange == exchange && s.ticker == ticker)
  if(mats.length > 0) {
    klocal.setSymbol(mats[0])
  }
  if(typeof period === 'string' && period){
    klocal.setPeriod(makePeriod(period))
  }
  if(typeof ind === 'string' && ind){
    const knowns = store.all_inds.reduce((acc: Record<string, boolean>, obj) => {acc[obj.name] = obj.is_main; return acc}, {})
    const added = klocal.save_inds.map(v => v.name)
    ind.split('+').forEach(name => {
      if(added.includes(name))return
      if(name in knowns){
        const pane_id = knowns[name] ? 'candle_pane': `pane_${name}`
        klocal.save_inds.push({name, pane_id})
      }
      else{
        klocal.save_inds.push({name, pane_id: ''})
        console.log('add unknown ind:', name)
      }
    })
  }
}

onMounted(() => {
  setTimezone()
  loadSymbols()
})

watch(() => store.pairs_loading, (loading) => {
  if(loading)return
  loadQueryInds()
})

if(process.client) {
  window.addEventListener("message", async (event) => {
    console.log('receive msg in char:', event)
    if (event.data.type !== 'symbol') return
    const ticker = event.data.code
    const mats = await searchSymbols(event.data.code)
    if (mats.length > 0) {
      klocal.setSymbol(mats[0])
    }
  });
}

</script>

<style lang="scss">
.kline-slide{
  .opinion-box{
    flex-grow: 1;
  }
}
</style>