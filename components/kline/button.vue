<template>
  <button class="klinecharts-pro-button" :class="[(type || 'confirm')]">
    <slot/>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: string
}>()
</script>

<style lang="scss">
@import '~/assets/klinebase.scss';

.#{$prefix-cls}-button {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  outline: none;
  width: 90px;
  height: 36px;
  font-size: 14px;
  border-radius: 2px;
  border: solid 1px var(--klinecharts-pro-primary-color);
  cursor: pointer;
  background-color: transparent;
  box-sizing: border-box;
  &.confirm {
    color: #ffffff;
    background-color: var(--klinecharts-pro-primary-color);
  }
  &.cancel {
    color: var(--klinecharts-pro-primary-color);
    border: solid 1px var(--klinecharts-pro-primary-color);
  }
}

</style>