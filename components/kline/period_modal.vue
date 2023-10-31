<script setup lang="ts">
import {computed, defineEmits, defineProps, onMounted, reactive, ref, watch} from "vue";
import Modal from "~/components/kline/modal.vue"
import List from "~/components/kline/list.vue";
import {AllPeriods} from "~/composables/kline/coms";
import {useKlineLocal} from "~/stores/klineLocal";
import {getDefaults} from "~/config";
import {type Period} from "~/composables/types";

const props = defineProps<{
  modelValue: boolean,
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean],
  'change': [item: Period]
}>()

const showModal = computed({
  get(){
    return props.modelValue
  },
  set(value){
    emit('update:modelValue', value)
  }
})

const defaults = getDefaults();
const store = useKlineLocal()
const periods = reactive(AllPeriods)
const activeTF = ref(defaults.period.timeframe)

onMounted(() => {
  watch(store.period, (period) => {
    activeTF.value = period.timeframe
  }, {immediate: true})
})

function clickPeriod(item: Period){
  showModal.value = false
  emit('change', item)
}

</script>

<template>
  <Modal :title="$t('timeframe')" :width="300" v-model="showModal">
    <List class="all-period">
      <div class="item" v-for="(item, index) in periods"
            :class="{selected: item.timeframe == activeTF}"
            @click="clickPeriod(periods[index])">
        <span>{{item.multiplier}} {{$t(item.timespan)}}</span>
      </div>
    </List>
  </Modal>
</template>

<style lang="scss">
.all-period{
  min-height: 0;
  max-height: 500px;
  margin: 0 auto;
  .item{
    line-height: 40px;
    height: 40px;
    padding: 0 20px;
    box-sizing: border-box;
    cursor: pointer;
    text-align: center;
    border-bottom: 1px solid var(--klinecharts-pro-border-color);
  }
  .item:hover {
    background: var(--klinecharts-pro-hover-background-color);
  }
  .item.selected{
    background: var(--klinecharts-pro-primary-color);
    color: #ffffff;
  }
}
</style>