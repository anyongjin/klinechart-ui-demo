<template>
  <Modal v-model="showModal" :title="store.editIndName" :buttons="['confirm']" @click="clickModel" :width="360">
    <div class="empty-msg" v-if="!fields.length">
      <div class="text-block">{{$t('no_ind_params')}}</div>
    </div>
    <div class="klinecharts-pro-indicator-setting-modal-content" v-else>
      <template v-for="(d, i) in fields">
        <span>{{$t(d.paramNameKey)}}</span>
        <Input v-model="params[i]" style="width: '200px'" :precision="d.precision" :min="d.min"/>
      </template>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import Input from "~/components/kline/input.vue"
import { Chart, Indicator } from 'klinecharts'
import kc from "klinecharts"
import {GetIndFields} from "~/composables/kline/inds"
import {defineEmits, reactive, computed, watch} from "vue";
import {useKlineStore} from "~/stores/kline";
import {useKlineLocal} from "~/stores/klineLocal";

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
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

const klocal = useKlineLocal()
const store = useKlineStore()
const IndFieldsMap = GetIndFields();
const params = reactive<any[]>([])
const fields = reactive<any[]>([])

watch(() => [store.editPaneId, store.editIndName], ([new_pid, new_ind]) => {
  if(!store.chart)return
  fields.splice(0, fields.length)
  fields.push(...(IndFieldsMap[new_ind] ?? []))
  const indicator = store.chart.getIndicatorByPaneId(new_pid, new_ind) as Indicator
  params.splice(0, params.length)
  if(indicator?.calcParams){
    params.push(...(indicator?.calcParams ?? []))
  }
})

function clickModel(from: string){
  showModal.value = false
  if(from !== 'confirm' || fields.length == 0){
    return;
  }
  const result: any[] = []
  params.forEach((param: any, i: number) => {
    if (!kc.utils.isValid(param) || param === '') {
      if (fields[i].default) {
        param = fields[i].default
      }
    }
    if(param){
      result.push(Number(param))
    }
  })
  const item = {name: store.editIndName, params: result, pane_id: store.editPaneId}
  store.chart?.overrideIndicator({name: store.editIndName, calcParams: result}, store.editPaneId)
  const idx = klocal.save_inds.findIndex(ind => ind.name == item.name && ind.pane_id == item.pane_id)
  if(idx >= 0){
    klocal.save_inds.splice(idx, 1, item)
  }
  else{
    klocal.save_inds.push(item)
  }
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
.empty-msg{
  height: 100%;
  min-height: 120px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
