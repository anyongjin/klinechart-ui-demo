<template>
  <div class="klinecharts-pro-switch" :class="[className, open ? 'turn-on': 'turn-off']"
      @click="$emit('change', !open)" :style="cssVars">
    <i class="thumb"/>
  </div>
</template>

<script setup lang="ts">
import {defineProps} from "vue";

const props = defineProps<{
  className?: string,
  cssVars?: string,
  open: boolean
}>()


</script>

<style scoped lang="scss">
@import '~/assets/klinebase.scss';

.#{$prefix-cls}-switch {
  display: flex;
  flex-direction: row;
  position: relative;
  width: 36px;
  height: 18px;
  border-radius: 9px;
  cursor: pointer;
  .thumb {
    display: inline-block;
    position: absolute;
    top: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    z-index: 10;
    background-color: #ffffff;
    transition: all .2s;
  }

  &.turn-off {
    background-color: var(--klinecharts-pro-border-color);
    .thumb {
      left: 2px;
    }
  }
  &.turn-on {
    background-color: var(--klinecharts-pro-primary-color);
    .thumb {
      left: 20px;
    }
  }
}

</style>