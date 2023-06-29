<template>
  <Modal :title="$t('setting')" :width="560" :buttons="['restore_default']"
         v-model="showModal" @click="$emit('reset')">
    <div class="klinecharts-pro-setting-modal-content">
      <template v-for="(item, index) in options" :key="item.key">
        <span>{{item.text}}</span>
        <Select v-if="item.component == 'select'" :data-source="item.dataSource" css-vars="width: 120px"
                :value="$t(kc.utils.formatValue(styles, item.key))" @change="update(item.key, $event.key)"/>
        <Switch v-else-if="item.component == 'switch'" :open="!!kc.utils.formatValue(styles, item.key)"
                @change="update(item.key, $event)"/>
      </template>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import {getOptions} from "~/components/kline/setting_opts";
import Select from "~/components/kline/select.vue"
import Switch from "~/components/kline/switch.vue"
import {computed, defineEmits, defineProps, reactive} from "vue";
import {useNuxtApp} from "#app";
const {t} = useNuxtApp()
import {Chart, Styles} from "klinecharts";
import kc from "klinecharts"
import _ from "lodash"
const props = defineProps<{
  currentStyles: Styles,
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean],
  'change': [styles: Styles],
  'reset': []
}>()

const showModal = computed({
  get(){
    return props.modelValue
  },
  set(value){
    emit('update:modelValue', value)
  }
})

const styles = reactive(props.currentStyles ?? {})
const options = reactive(getOptions())

function update(key: string, value: any){
  _.set(styles, key, value)
  emit('change', styles)
}

</script>

<style scoped lang="scss">
@import "~/assets/klinebase.scss";

.#{$prefix-cls}-setting-modal-content {
  display: grid;
  grid-template-columns: auto auto auto auto;
  grid-row-gap: 20px;
  margin-top: 20px;
  margin-bottom: 30px;
  align-items: center;
}

</style>