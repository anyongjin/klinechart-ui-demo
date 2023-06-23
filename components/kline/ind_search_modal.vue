<template>
  <Modal :title="$t('indicator')" :width="800" v-model="showModal">
    <div class="kc-ind-modal">
      <List class="klinecharts-pro-ind-box ind-col left-pane">
        <div class="row title">{{$t(active_pane == 'candle_pane' ? 'main_indicator': 'sub_indicator')}}</div>
        <div class="row" v-for="(item, index) in all_pane_inds" :key="item.name">
          <span @click="addActiveInd(item.name)">{{ $t(item.name.toLowerCase()) }}</span>
        </div>
      </List>
      <div class="select-box ind-col">
        <List class="klinecharts-pro-ind-box pane-box" v-for="pane in _panes" :key="pane.name">
          <div class="row title" @click="active_pane = pane.name">{{paneTitle(pane)}}</div>
          <template v-if="pane.name == active_pane">
            <div class="row" v-for="(item, index) in pane.inds" :key="item">
              <span>{{ $t(item.toLowerCase()) }}</span>
              <svg @click="clickIndDelete(item)" class="icon" viewBox="0 0 1024 1024" p-id="2382" width="20" height="20">
                <path d="M176 130.752l-45.248 45.248 22.72 22.528L466.752 512l-336 336 45.248 45.248L512 557.248l313.28 313.472 22.72 22.528 45.248-45.248-22.528-22.72L557.248 512l336-336-45.248-45.248L512 466.752 198.528 153.472z" fill="" p-id="2383"></path>
              </svg>
            </div>
            <div class="row" v-if="!pane.inds.length">
              <span>{{ $t('check_from_left') }}</span>
            </div>
          </template>
        </List>
        <div class="add-pane" @click="addSubPane">{{ $t('add_sub_pane') }}</div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import List from "~/components/kline/list.vue"
import {PaneInds} from "~/components/kline/types";
import {computed, defineEmits, defineProps, reactive} from "vue";
import {Chart} from "klinecharts";
import Checkbox from "~/components/kline/checkbox.vue";
import i18n from "~/composables/i18n"
let t = i18n.global.t

const props = defineProps<{
  modelValue: boolean,
  panes: PaneInds[]
}>()

const _panes = reactive(props.panes ?? [])
if(!_panes.find(i => i.name == 'candle_pane')){
  _panes.unshift({name: 'candle_pane', inds: []})
}
const active_pane = ref('candle_pane')

const emit = defineEmits<{
  'change': [paneId: string, ind_name: string, is_add: boolean],
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

type IndItem = {
  name: string,
  is_main: boolean
}


const all_inds = reactive([
    {name: 'MA', is_main: true},
    {name: 'EMA', is_main: true},
    {name: 'SMA', is_main: true},
    {name: 'BOLL', is_main: true},
    {name: 'SAR', is_main: true},
    {name: 'BBI', is_main: true},
    {name: 'VOL', is_main: false},
    {name: 'MACD', is_main: false},
    {name: 'KDJ', is_main: false},
    {name: 'RSI', is_main: false},
    {name: 'BIAS', is_main: false},
    {name: 'BRAR', is_main: false},
    {name: 'CCI', is_main: false},
    {name: 'DMI', is_main: false},
    {name: 'CR', is_main: false},
    {name: 'PSY', is_main: false},
    {name: 'DMA', is_main: false},
    {name: 'TRIX', is_main: false},
    {name: 'OBV', is_main: false},
    {name: 'VR', is_main: false},
    {name: 'WR', is_main: false},
    {name: 'MTM', is_main: false},
    {name: 'EMV', is_main: false},
    {name: 'SAR', is_main: false},
    {name: 'ROC', is_main: false},
    {name: 'PVT', is_main: false},
    {name: 'AO', is_main: false},
])

const all_pane_inds = computed(() => {
  if(active_pane.value == 'candle_pane'){
    return all_inds.filter(it => it.is_main)
  }
  else{
    return all_inds.filter(it => !it.is_main)
  }
})


function paneTitle(pane: PaneInds){
  let result = [];
  if(pane.name == 'candle_pane'){
    result.push(t('main_pane') + ':')
  }
  else {
    result.push(pane.name + ':')
  }
  for(let ind_name of pane.inds){
    result.push(ind_name)
    result.push(' ')
  }
  return result.join('')
}

function addActiveInd(ind_name: string){
  for(let pane of _panes){
    if(pane.name == active_pane.value){
      pane.inds.push(ind_name)
      emit('change', active_pane.value, ind_name, true)
      break
    }
  }
}

function clickIndDelete(ind_name: string){
  for(let pane of _panes){
    if(pane.name == active_pane.value){
      pane.inds.splice(pane.inds.indexOf(ind_name), 1)
      emit('change', active_pane.value, ind_name, false)
      break
    }
  }
}

function addSubPane(){
  let last = _panes[_panes.length - 1]
  let cur_id = 1
  if(last.name.startsWith('pane')){
    cur_id = parseInt(last.name.substring(4)) + 1
  }
  let name = 'pane' + cur_id;
  _panes.push({name, inds: []})
  active_pane.value = name
}

</script>

<style lang="scss">
@import '~/assets/klinebase.scss';

.kc-ind-modal{
  display: flex;
  flex-direction: row;
  .ind-col{
    flex-grow: 1;
    max-height: 500px;
    width: 50%;
    overflow-y: scroll;
  }
  .left-pane{
    border-right: 1px solid #aaaaaa;
  }
}

.#{$prefix-cls}-ind-box {
  min-height: 0;
  .title {
    position: sticky;
    top: 0;
    font-size: 16px;
    color: var(--klinecharts-pro-text-color);
    background-color: var(--klinecharts-pro-popover-background-color);
    font-weight: 400;
  }
  .row{
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    padding: 0 20px;
    box-sizing: border-box;
    cursor: pointer;
    justify-content: space-between;
  }
  .row:hover {
    .checkbox {
      fill: var(--klinecharts-pro-primary-color);
      color: var(--klinecharts-pro-primary-color);
    }
  }
}

.pane-box{
  border: 1px solid $c-text-second-dark;
  border-radius: 10px;
  margin: 10px;
  .title{
    background-color: #eeeeee;
  }
}

.add-pane{
  padding: 0 20px;
  text-align: center;
  height: 40px;
  line-height: 40px;
  color: $c-primary;
  margin: 0 30px;
  border-radius: 30px;
  border: 1px solid $c-primary;
  cursor: pointer;
}

</style>