<template>
  <div :style="cssVars" class="klinecharts-pro-input" :class="className"
    :data-status="status" @click="clickBox">
    <slot name="prefix"/>
    <input ref="input" class="value" :placeholder="placeholder" :value="value"
           @focus="status = 'focus'" @blur="status = 'normal'"
           @keyup="inputChange($event, 'keyup')" @change="inputChange($event, 'change')">
    <slot name="suffix"/>
  </div>
</template>

<script setup lang="ts">

import {onMounted, ref} from "vue";
import {ChangeEvent} from "rollup";

const props = defineProps<{
  cssVars?: string,
  className?: string,
  precision?: number
  min?: number
  max?: number
  placeholder?: string
  value: string | number
  disabled?: boolean
}>()

const emit = defineEmits<{
  change: [value: number | string],
  keyup: [value: number | string],
}>()

const status = ref('normal')
const input = ref(null)


function clickBox(){
  if(input.value){
    (input.value as HTMLInputElement).focus()
  }
}

function inputChange(e: any, name: string){
  let v = e.target.value
  if(props.precision && v !== '') {
    let reg
    const decimalDigit = Math.max(0, Math.floor(props.precision!))
    if (decimalDigit <= 0) {
      reg = new RegExp(/^[1-9]\d*$/)
    } else {
      reg = new RegExp('^\\d+\\.?\\d{0,' + decimalDigit + '}$')
    }
    if(!reg.test(v))return
    v = 0 + v;
    if(props.min && v < props.min)return;
    if(props.max && v > props.max)return;
  }
  if(name == 'change'){
    emit('change', v);
  }
  else{
    emit('keyup', v);
  }
}

</script>

<style lang="scss">
@import '~/assets/klinebase.scss';

.#{$prefix-cls}-input {
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  height: 34px;
  border: solid 1px var(--klinecharts-pro-border-color);
  border-radius: 2px;
  padding: 0 12px;
  font-size: 12px;
  color: var(--klinecharts-pro-text-color);
  box-sizing: border-box;
  cursor: pointer;
  &[data-status="focus"] {
    border-color: var(--klinecharts-pro-primary-color);
  }
  .prefix {
    display: flex;
    white-space: nowrap;
    padding-right: 10px;
  }
  .suffix {
    display: flex;
    white-space: nowrap;
    padding-left: 10px;
  }
  .value {
    width: 100%;
    border: none;
    outline: none;
    border: none;
    background: transparent;
    color: var(--klinecharts-pro-text-color);
    font-size: 14px;
    cursor: pointer;
  }
}

</style>