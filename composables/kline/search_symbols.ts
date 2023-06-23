import {ref, isRef, unref, watchEffect} from "vue";
import {Datafeed, SymbolInfo} from "~/components/kline/types";

export function useSearchSymbol(feeder: Datafeed, keyword: string | Ref){
  const symbols = ref<SymbolInfo[]>([])
  const error = ref(null)
  const loading = ref(false)

  function doFetch(){
    loading.value = true
    symbols.value = []
    error.value = null
    feeder.searchSymbols(unref(keyword)).then(res => {
      symbols.value = res
      loading.value = false
    })
    .catch(err => {
      error.value = err
      loading.value = false
    })
  }

  if(isRef(keyword)){
    watchEffect(doFetch)
  }
  else {
    doFetch()
  }
  return {symbols, error, loading}
}