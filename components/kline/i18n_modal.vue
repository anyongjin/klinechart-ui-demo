<template>
  <Modal :title="$t('language')" :buttons="['confirm']" :width="400" class="timezone"
         v-model="showModal" @click="clickModal">
    <Select :data-source="locales" :value="localeMap[selected]" value_key="name"
            @change="selected = $event.code"/>
  </Modal>
</template>

<script lang="ts" setup>
import Modal from "~/components/kline/modal.vue"
import Select from "~/components/kline/select.vue"
import {computed, defineProps, reactive, ref, defineEmits} from "vue";
import {useI18n} from "vue-i18n"
import {navigateTo} from "#app";
import {type LocaleObject, useSwitchLocalePath} from "#i18n";
const {locale, locales} = useI18n()
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

const selected = ref(locale.value)
const switchLocalePath = useSwitchLocalePath()
const localeMap = reactive(Object.fromEntries(locales.value.map(item => {
  const {code, name} = item as LocaleObject;
  return [code, name]
})))

function clickModal(from: string){
  if(from !== 'confirm')return
  const code = selected.value as string
  navigateTo(switchLocalePath(code))
}

</script>

<style scoped>

</style>