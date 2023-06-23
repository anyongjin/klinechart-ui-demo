<template>
  <Modal v-model="showModal" :title="indName" :buttons="['confirm']" @click="clickModel" :width="360">
    <div class="klinecharts-pro-indicator-setting-modal-content">
      <template v-for="(d, i) in fields">
        <span>{{$t(d.paramNameKey)}}</span>
        <Input :value="params[i]" css-vars="width: '200px'" :precision="d.precision"
               :min="d.min" @change="params[i] = $event"/>
      </template>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import Input from "~/components/kline/input.vue"
import { utils, Chart, Indicator } from 'klinecharts'
import IndFields from "~/components/kline/inds"
import {defineEmits, reactive, computed} from "vue";

const props = defineProps<{
  chart: Chart,  // 绘图对象
  indName: string,  // 指标ID
  paneId: string,  // 指标所属面板
  modelValue: boolean
}>()

const emit = defineEmits<{
  confirm: [indName: string, paneId: string, params: any[]],
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

const indicator = props.chart?.getIndicatorByPaneId(props.paneId, props.indName) as Indicator
const params = reactive(indicator?.calcParams ?? {})

const IndFieldsMap = Object.fromEntries(Object.entries(IndFields));
const fields = reactive(Object.fromEntries(Object.entries(IndFieldsMap[props.indName] ?? {})))

function clickModel(from: string){
  if(from !== 'confirm')return;
  const result: any[] = []
  params.forEach((param: any, i: number) => {
    if (!utils.isValid(param) || param === '') {
      if (fields[i].default) {
        param = fields[i].default
      }
    }
    result.push(param)
  })
  props.chart.overrideIndicator({name: props.indName, calcParams: result}, props.paneId)
  emit('confirm', props.indName, props.paneId, result)
}

</script>

<style scoped lang="scss">
@import '~/assets/klinebase.scss';

.#{$prefix-cls}-indicator-setting-modal-content {
  display: grid;
  grid-template-columns: auto auto;
  grid-row-gap: 20px;
  margin-top: 20px;
  align-items: center;
}
</style>
