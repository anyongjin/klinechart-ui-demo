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
      <List v-if="item.key === popoverKey" class="list">
        <li v-for="data in item.list" @click="clickSubPopover(index, data.key)">
          <Icon :name="data.key"/>
          <span style="padding-left:8px">{{$t(data.text)}}</span>
        </li>
      </List>
    </div>
    <div class="item">
      <span style="width:30px;height:30px" @click="startOverlay('ruler')">
        <svg viewBox="0 0 1024 1024"><path d="M724.992 0.903529L0.903529 724.992l298.164706 298.104471 724.028236-724.028236-298.104471-298.164706zM86.076235 724.992l41.923765-41.923765 85.172706 85.172706 42.586353-42.586353-85.172706-85.172706 43.309176-43.309176 42.586353 42.586353 42.586353-42.586353-42.586353-42.586353 42.586353-42.586353 85.172706 85.172706 42.586353-42.586353-85.172706-85.172706 41.923765-41.923765 42.586353 42.586353 42.586353-42.586353-42.586353-42.586353 42.586353-42.586353 85.172706 85.172706 42.586353-42.586353-85.172706-85.172705 43.248941-43.248942 42.586353 42.586353 42.586353-42.586353-42.586353-42.586353 42.586353-42.586353 85.232941 85.172706 42.586353-42.586353-85.232941-85.172705 42.646588-42.646589 212.931765 212.992L299.068235 937.923765l-212.992-212.931765z" p-id="5018"></path></svg>
      </span>
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
      <List v-if="'mode' === popoverKey" class="list">
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
import {Chart, Overlay, OverlayEvent, OverlayMode, OverlayRemove} from "klinecharts";
import {postApi} from "~/utils/netio";
import {useAuthState} from "~/composables/auth";
import {type Period, type SymbolInfo} from "~/composables/types";
import {useKlineLocal} from "~/stores/klineLocal";
import {useKlineStore} from "~/stores/kline";

const popoverKey = ref('')
const modeIcon = ref('weakMagnet')
const mode = ref('normal')
const lock = ref(false)
const visiable = ref(true)
const hisLays = reactive<string[]>([])  // 按创建顺序，记录所有overlay，方便删除
const selectDraw = ref('')
const delOverlayIds: string[] = []
const layIdMap: Record<string, any> = {}
const {authStatus} = useAuthState()
const store = useKlineLocal()
const main = useKlineStore()

const GROUP_ID = 'drawing_tools'


const singleLineOpts = [
  { key: 'segment', text: 'segment' },
  { key: 'arrow', text: 'arrow' },
  { key: 'rayLine', text: 'ray_line' },
  { key: 'straightLine', text: 'straight_line' },
  { key: 'priceLine', text: 'price_line' },
  { key: 'horizontalStraightLine', text: 'horizontal_straight_line' },
  { key: 'horizontalRayLine', text: 'horizontal_ray_line' },
  { key: 'horizontalSegment', text: 'horizontal_segment' },
  { key: 'verticalStraightLine', text: 'vertical_straight_line' },
  { key: 'verticalRayLine', text: 'vertical_ray_line' },
  { key: 'verticalSegment', text: 'vertical_segment' },
]

const moreLineOpts = [
  { key: 'priceChannelLine', text: 'price_channel_line' },
  { key: 'parallelStraightLine', text: 'parallel_straight_line' }
]

const polygonOpts = [
  { key: 'circle', text: 'circle' },
  { key: 'rect', text: 'rect' },
  { key: 'parallelogram', text: 'parallelogram' },
  { key: 'triangle', text: 'triangle' }
]

const fibonacciOpts = [
  { key: 'fibonacciLine', text: 'fibonacci_line' },
  { key: 'fibonacciSegment', text: 'fibonacci_segment' },
  { key: 'fibonacciCircle', text: 'fibonacci_circle' },
  { key: 'fibonacciSpiral', text: 'fibonacci_spiral' },
  { key: 'fibonacciSpeedResistanceFan', text: 'fibonacci_speed_resistance_fan' },
  { key: 'fibonacciExtension', text: 'fibonacci_extension' },
  { key: 'gannBox', text: 'gann_box' }
]

const waveOpts = [
  { key: 'xabcd', text: 'xabcd' },
  { key: 'abcd', text: 'abcd' },
  { key: 'threeWaves', text: 'three_waves' },
  { key: 'fiveWaves', text: 'five_waves' },
  { key: 'eightWaves', text: 'eight_waves' },
  { key: 'anyWaves', text: 'any_waves' },
]

const overlays = reactive([
  { key: 'single-line', icon: 'segment', list: singleLineOpts },
  { key: 'more-line', icon: 'priceChannelLine', list: moreLineOpts },
  { key: 'polygon', icon: 'circle', list: polygonOpts },
  { key: 'fibonacci', icon: 'fibonacciLine', list: fibonacciOpts },
  { key: 'wave', icon: 'xabcd', list: waveOpts }
])

const modes = reactive([
  { key: 'weakMagnet', text: 'weakMagnet' },
  { key: 'strongMagnet', text: 'strongMagnet' }
])

function clickPopoverKey(value: string){
  if(popoverKey.value == value){
    popoverKey.value = "";
  }
  else{
    popoverKey.value = value
  }
}

function addOverlay(data: any){
  let moved = false;
  let defData = {
    groupId: GROUP_ID,
    onDrawEnd: (event: OverlayEvent) => {
      return true
    },
    onPressedMoving: (event: OverlayEvent) => {
      moved = true;
      return false
    },
    onPressedMoveEnd: (event: OverlayEvent) => {
      if(!moved)return true
      moved = false
      return true
    },
    onSelected: (event: OverlayEvent) => {
      selectDraw.value = event.overlay.id
      return true;
    },
    onDeselected: (event: OverlayEvent) => {
      selectDraw.value = ''
      return true;
    },
    onRemoved: (event: OverlayEvent) => {
      delOverlayIds.push(event.overlay.id)
      return true
    }
  }
  const layId = main.chart?.createOverlay({...defData, ...data})
  if(layId){
    if(Array.isArray(layId)){
      hisLays.push(...(layId as string[]))
    }
    else{
      hisLays.push(layId as string)
    }
  }
  if(data.ban_id && layId){
    layIdMap[layId as string] = data.ban_id
  }
  return layId;
}

function startOverlay(value: string){
  addOverlay({
    name: value,
    visible: visiable.value,
    lock: lock.value,
    mode: mode.value as OverlayMode,
  })
}

function clickSubPopover(index: number, value: string){
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
  main.chart?.overrideOverlay({ mode: cur_mode as OverlayMode })
}

function clickSubMode(value: string){
  modeIcon.value = value;
  mode.value = value;
  popoverKey.value = '';
  main.chart?.overrideOverlay({ mode: value as OverlayMode })
}

function toggleLock(){
  lock.value = !lock.value;
  main.chart?.overrideOverlay({ lock: lock.value });
}

function toggleVisiable(){
  visiable.value = !visiable.value
  main.chart?.overrideOverlay({ visible: visiable.value })
}

function clickRemove(){
  let args: OverlayRemove = { groupId: GROUP_ID };
  if(selectDraw.value){
    args['id'] = selectDraw.value
  }
  else if(hisLays.length > 0){
    args['id'] = hisLays.pop()
  }
  delOverlayIds.splice(0, delOverlayIds.length)
  main.chart?.removeOverlay(args)
}


defineExpose({
  clickRemove,
  addOverlay
})
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