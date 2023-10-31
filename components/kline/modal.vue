<template>
  <div class="klinecharts-pro-modal" v-if="modelValue">
    <div :style="{width: (width || 400) + 'px'}" class="inner">
      <div class="title-container">
        {{title}}
        <svg class="close-icon" viewBox="0 0 1024 1024" @click="emit('update:modelValue', false)">
          <path
            d="M934.184927 199.723787 622.457206 511.452531l311.727721 311.703161c14.334473 14.229073 23.069415 33.951253 23.069415 55.743582 0 43.430138-35.178197 78.660524-78.735226 78.660524-21.664416 0-41.361013-8.865925-55.642275-23.069415L511.149121 622.838388 199.420377 934.490384c-14.204513 14.20349-33.901111 23.069415-55.642275 23.069415-43.482327 0-78.737272-35.230386-78.737272-78.660524 0-21.792329 8.864902-41.513486 23.094998-55.743582l311.677579-311.703161L88.135828 199.723787c-14.230096-14.255679-23.094998-33.92567-23.094998-55.642275 0-43.430138 35.254945-78.762855 78.737272-78.762855 21.741163 0 41.437761 8.813736 55.642275 23.069415l311.727721 311.727721L822.876842 88.389096c14.281261-14.255679 33.977859-23.069415 55.642275-23.069415 43.557028 0 78.735226 35.332716 78.735226 78.762855C957.254342 165.798117 948.5194 185.468109 934.184927 199.723787" />
        </svg>
      </div>
      <div class="content-container">
        <slot/>
      </div>
      <div v-if="buttons && buttons.length > 0" class="button-container">
        <Button v-for="item in buttons" :key="item" :type="btn_type(item)" @click.prevent="clickButton(item)">
          {{$t(item)}}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from "~/components/kline/button.vue"
import {defineEmits} from "@vue/runtime-core";


const props = defineProps<{
  width: number,
  title: string,
  buttons?: string[],
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean],
  click: [from: string]
}>()

function btn_type(item: string){
  if(['confirm', 'cancel'].includes(item)){
    return item;
  }
  return 'button';
}

function clickButton(from: string){
  if(from == 'close'){
    emit('update:modelValue', false)
  }
  emit('click', from)
}
</script>

<style lang="scss">
@import '~/assets/klinebase.scss';

.#{$prefix-cls}-modal {
  position: absolute;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, .2);
  z-index: 99;
  .inner {
    background-color: var(--klinecharts-pro-popover-background-color);
    box-shadow: 0 6px 12px 0 rgba(0, 0, 0, .3);
    border-radius: 4px;
    .title-container {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      height: 52px;
      padding: 0 26px;
      font-size: 18px;
      font-weight: bold;
      color: var(--klinecharts-pro-text-color);
      position: relative;
      box-sizing: border-box;
      border-bottom: solid 1px var(--klinecharts-pro-border-color);
      .close-icon {
        width: 14px;
        height: 14px;
        cursor: pointer;
        fill: var(--klinecharts-pro-text-color);
        &:hover {
          fill: var(--klinecharts-pro-primary-color);
        }
      }
    }
    .content-container {
      padding: 0 26px;
      min-height: 140px;
    }
    .button-container {
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      padding: 20px 20px 26px 20px;
    }
  }
  .#{$prefix-cls}-button{
    margin-left: 20px;
  }
}
</style>