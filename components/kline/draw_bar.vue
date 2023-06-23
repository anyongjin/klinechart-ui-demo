<template>
  <div class="klinecharts-pro-drawing-bar">
    <div v-for="(item, index) in overlays" class="item" @blur="popoverKey = ''">
      <span style="width:32px;height:32px" @click="startOverlay(item.icon)">
        <Icon :name="item.icon" />
      </span>
      <div class="icon-arrow" @click="clickPopoverKey(item.key)">
        <svg :class="{rotate: item.key === popoverKey}" viewBox="0 0 4 6">
          <path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z" stroke="none" stroke-opacity="0"/>
        </svg>
      </div>
      <List v-if="item.key === popoverKey" class-name="list">
        <li v-for="data in item.list" @click="clickSubPopover(index, data.key)">
          <Icon :name="data.key"/>
          <span style="padding-left:8px">{{data.text}}</span>
        </li>
      </List>
    </div>
    <span class="split-line"/>
    <div class="item" @blur="popoverKey = ''">
      <span style="width:32px;height:32px" @click="clickMode">
        <Icon :name="modeIcon" :class="{selected: mode == modeIcon}"/>
      </span>
      <div class="icon-arrow" @click="clickPopoverKey('mode')">
        <svg :class="{rotate: popoverKey == 'mode'}" viewBox="0 0 4 6">
          <path d="M1.07298,0.159458C0.827521,-0.0531526,0.429553,-0.0531526,0.184094,0.159458C-0.0613648,0.372068,-0.0613648,0.716778,0.184094,0.929388L2.61275,3.03303L0.260362,5.07061C0.0149035,5.28322,0.0149035,5.62793,0.260362,5.84054C0.505822,6.05315,0.903789,6.05315,1.14925,5.84054L3.81591,3.53075C4.01812,3.3556,4.05374,3.0908,3.92279,2.88406C3.93219,2.73496,3.87113,2.58315,3.73964,2.46925L1.07298,0.159458Z" stroke="none" stroke-opacity="0"/>
        </svg>
      </div>
      <List v-if="'mode' === popoverKey" class-name="list">
        <li v-for="data in modes" @click="clickSubMode(data.key)">
          <Icon :name="data.key"/>
          <span style="padding-left:8px">{{data.text}}</span>
        </li>
      </List>
    </div>
    <div class="item">
      <span style="width:32px;height:32px" @click="toggleLock">
        <Icon v-if="lock" name="lock"/>
        <Icon v-else name="unlock" />
      </span>
    </div>
    <div class="item">
      <span style="width:32px;height:32px" @click="toggleVisiable">
        <Icon v-if="visiable" name="visible" />
        <Icon v-else name="invisible" />
      </span>
    </div>
    <span class="split-line"/>
    <div class="item">
      <span style="width:32px;height:32px" @click="clickRemove">
        <Icon name="remove" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import Icon from "~/components/kline/icon.vue"
import List from "~/components/kline/list.vue"
import {defineEmits, defineProps, reactive, ref} from 'vue'
import {Integer} from "type-fest";
import {integer} from "vscode-languageserver-types";
import {Chart, OverlayMode, OverlayRemove} from "klinecharts";
import i18n from "~/composables/i18n"
let t = i18n.global.t

const popoverKey = ref('')
const modeIcon = ref('weakMagnet')
const mode = ref('normal')
const lock = ref(false)
const visiable = ref(true)
const selectDraw = ref('')

const props = defineProps<{
  chart: Chart
}>()

const GROUP_ID = 'drawing_tools'


const singleLineOpts = [
  { key: 'horizontalStraightLine', text: t('horizontal_straight_line') },
  { key: 'horizontalRayLine', text: t('horizontal_ray_line') },
  { key: 'horizontalSegment', text: t('horizontal_segment') },
  { key: 'verticalStraightLine', text: t('vertical_straight_line') },
  { key: 'verticalRayLine', text: t('vertical_ray_line') },
  { key: 'verticalSegment', text: t('vertical_segment') },
  { key: 'straightLine', text: t('straight_line') },
  { key: 'rayLine', text: t('ray_line') },
  { key: 'segment', text: t('segment') },
  { key: 'arrow', text: t('arrow') },
  { key: 'priceLine', text: t('price_line') },
]

const moreLineOpts = [
  { key: 'priceChannelLine', text: t('price_channel_line') },
  { key: 'parallelStraightLine', text: t('parallel_straight_line') }
]

const polygonOpts = [
  { key: 'circle', text: t('circle') },
  { key: 'rect', text: t('rect') },
  { key: 'parallelogram', text: t('parallelogram') },
  { key: 'triangle', text: t('triangle') }
]

const fibonacciOpts = [
  { key: 'fibonacciLine', text: t('fibonacci_line') },
  { key: 'fibonacciSegment', text: t('fibonacci_segment') },
  { key: 'fibonacciCircle', text: t('fibonacci_circle') },
  { key: 'fibonacciSpiral', text: t('fibonacci_spiral') },
  { key: 'fibonacciSpeedResistanceFan', text: t('fibonacci_speed_resistance_fan') },
  { key: 'fibonacciExtension', text: t('fibonacci_extension') },
  { key: 'gannBox', text: t('gann_box') }
]

const waveOpts = [
  { key: 'xabcd', text: t('xabcd') },
  { key: 'abcd', text: t('abcd') },
  { key: 'threeWaves', text: t('three_waves') },
  { key: 'fiveWaves', text: t('five_waves') },
  { key: 'eightWaves', text: t('eight_waves') },
  { key: 'anyWaves', text: t('any_waves') },
]

const overlays = reactive([
  { key: 'single-line', icon: 'horizontalStraightLine', list: singleLineOpts },
  { key: 'more-line', icon: 'priceChannelLine', list: moreLineOpts },
  { key: 'polygon', icon: 'circle', list: polygonOpts },
  { key: 'fibonacci', icon: 'fibonacciLine', list: fibonacciOpts },
  { key: 'wave', icon: 'xabcd', list: waveOpts }
])

const modes = reactive([
  { key: 'weakMagnet', text: t('weakMagnet') },
  { key: 'strongMagnet', text: t('strongMagnet') }
])

function clickPopoverKey(value: string){
  if(popoverKey.value == value){
    popoverKey.value = "";
  }
  else{
    popoverKey.value = value
  }
}

function startOverlay(value: string){
  props.chart.createOverlay({
    groupId: GROUP_ID,
    name: value,
    visible: visiable.value,
    lock: lock.value,
    mode: mode.value as OverlayMode,
    onSelected: event => {
      selectDraw.value = event.overlay.id
      return true;
    },
    onDeselected: event => {
      selectDraw.value = ''
      return true;
    },
  })
}

function clickSubPopover(index: integer, value: string){
  overlays[index].icon = value;
  startOverlay(value)
  popoverKey.value = '';
}

function clickMode(){
  let cur_mode = modeIcon.value
  if (mode.value !== 'normal') {
    cur_mode = 'normal'
  }
  mode.value = cur_mode;
  props.chart.overrideOverlay({ mode: cur_mode as OverlayMode })
}

function clickSubMode(value: string){
  modeIcon.value = value;
  mode.value = value;
  popoverKey.value = '';
  props.chart.overrideOverlay({ mode: value as OverlayMode })
}

function toggleLock(){
  lock.value = !lock.value;
  props.chart.overrideOverlay({ lock: lock.value });
}

function toggleVisiable(){
  visiable.value = !visiable.value
  props.chart.overrideOverlay({ visible: visiable.value })
}

function clickRemove(){
  let args: OverlayRemove = { groupId: GROUP_ID };
  if(selectDraw.value){
    args['id'] = selectDraw.value
  }
  props.chart.removeOverlay(args)
}
</script>

<style scoped lang="scss">
@import '~/assets/klinebase.scss';

$gap: 8px;

.#{$prefix-cls}-drawing-bar {
  width: $drawing-bar-width;
  height: 100%;
  box-sizing: border-box;
  border-right: solid 1px var(--klinecharts-pro-border-color);
  .item {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 100%;
    margin-top: $gap;
    cursor: pointer;
    color: var(--klinecharts-pro-text-second-color);
    fill: var(--klinecharts-pro-text-second-color);
    stroke: var(--klinecharts-pro-text-second-color);
    .icon-overlay {
      width: 32px;
      height: 32px;
      border-radius: 2px;
      transition: all 0.2s;
      &:hover {
        background-color: var(--klinecharts-pro-hover-background-color);
      }
      &.selected {
        background-color: var(--klinecharts-pro-selected-color)!important;
        fill: var(--klinecharts-pro-primary-color);
        stroke: var(--klinecharts-pro-primary-color);
      }
    }
    .icon-arrow {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      position: absolute;
      top: 0;
      right: 0;
      height: 32px;
      width: 10px;
      opacity: 0;
      transition: all .2s;
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
      z-index: 10;
      svg {
        width: 4px;
        height: 6px;
        transition: all .2s;
        &.rotate {
          transform: rotate(180deg);
        }
      }
      &:hover {
        background-color: var(--klinecharts-pro-hover-background-color);
      }
    }

    .list {
      position: absolute;
      top: 0;
      white-space: nowrap;
      left: calc(100% + 1px);
      background-color: var(--klinecharts-pro-popover-background-color);
      z-index: 99;
      box-shadow: 0 6px 12px 0 rgba(0, 0, 0, .3);
      min-height: auto;
      max-height: 320px;
      li {
        padding-left: 16px;
        .icon-overlay {
          &:hover {
            background-color: transparent;
          }
        }
      }
    }

    &:hover {
      .icon-arrow {
        opacity: 1;
      }
    }
  }

  .split-line {
    display: block;
    width: 100%;
    height: 1px;
    background-color: var(--klinecharts-pro-border-color);
    margin-top: $gap;
  }
}
</style>