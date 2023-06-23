<template>
  <Modal :title="$t('symbol_search')" :width="460" v-model="showModal">
    <Input :value="keyword" class-name="klinecharts-pro-symbol-search-modal-input"
           :placeholder="$t('symbol_code')" @keyup="keyword = $event">
      <template #suffix>
        <span class="suffix">
          <svg viewBox="0 0 1024 1024">
            <path d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667z"/>
          </svg>
        </span>
      </template>
    </Input>
    <List class-name="klinecharts-pro-symbol-search-modal-list" :loading="loading">
      <li v-for="symbol in symbols" :key="symbol.name" @click="clickSymbol(symbol)">
        <div>
          <img v-if="symbol.logo" :src="symbol.logo" />
          <span :title="symbol.name">{{symbol.shortName ?? symbol.ticker}}</span>
        </div>
        {{symbol.exchange}}
      </li>
    </List>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import Input from "~/components/kline/input.vue"
import List from "~/components/kline/list.vue"
import {defineEmits, defineProps, reactive, ref, computed} from "vue";
import {Datafeed, SymbolInfo} from "~/components/kline/types";
import {useSearchSymbol} from "~/composables/kline/search_symbols"

const props = defineProps<{
  datafeed: Datafeed
  modelValue: boolean
}>()

const keyword = ref('')
const {symbols, error, loading} = useSearchSymbol(props.datafeed, keyword)

const emit = defineEmits<{
  select: [symbol: SymbolInfo],
  'update:modelValue': [value: boolean]
}>()

const showModal = computed({
  get(){
    return props.modelValue
  },
  set(value){
    emit('update:modelValue', value)
  }
})

function clickSymbol(symbol: SymbolInfo){
  showModal.value = false;
  emit('select', symbol)
}

</script>

<style scoped lang="scss">
@import '~/assets/klinebase.scss';

.#{$prefix-cls}-symbol-search-modal-input {
  margin: 20px 0 10px 0;
  height: 40px;
  svg {
    width: 18px;
    height: 18px;
    fill: var(--klinecharts-pro-text-second-color);
  }
  .value {
    font-size: 16px;
  }
}

.#{$prefix-cls}-symbol-search-modal-list {
  height: 400px;
  margin-left: -20px;
  margin-right: -20px;
  li {
    justify-content: space-between;
    div {
      display: flex;
      flex-direction: row;
      align-items: center;
      img {
        width: 16px;
        height: 16px;
        margin-right: 6px;
      }
      span {
        width: 300px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>