<template>
  <Modal :title="$t('indicator')" :width="600" v-model="showModal">
    <Input v-model="keyword" class="klinecharts-pro-symbol-search-modal-input"
           :placeholder="$t('search')">
      <template #suffix>
        <span class="suffix">
          <svg viewBox="0 0 1024 1024">
            <path d="M945.066667 898.133333l-189.866667-189.866666c55.466667-64 87.466667-149.333333 87.466667-241.066667 0-204.8-168.533333-373.333333-373.333334-373.333333S96 264.533333 96 469.333333 264.533333 842.666667 469.333333 842.666667c91.733333 0 174.933333-34.133333 241.066667-87.466667l189.866667 189.866667c6.4 6.4 14.933333 8.533333 23.466666 8.533333s17.066667-2.133333 23.466667-8.533333c8.533333-12.8 8.533333-34.133333-2.133333-46.933334zM469.333333 778.666667C298.666667 778.666667 160 640 160 469.333333S298.666667 160 469.333333 160 778.666667 298.666667 778.666667 469.333333 640 778.666667 469.333333 778.666667z"/>
          </svg>
        </span>
      </template>
    </Input>
    <div class="res-body">
      <div class="menu-box">
        <div class="item" @click="activeTab = 'local'" :class="{active: activeTab == 'local'}">
          <el-icon><TakeawayBox /></el-icon>
          <span>{{$t('local_inds')}}</span>
        </div>
        <div class="item" @click="activeTab = 'cloud'" :class="{active: activeTab == 'cloud'}">
          <el-icon><Cloudy /></el-icon>
          <span>{{$t('cloud_inds')}}</span>
        </div>
      </div>
      <List class="klinecharts-pro-ind-box">
        <div class="row" v-for="(item, index) in show_inds" :key="index">
          <Checkbox :model-value="checked_inds.includes(item.name)" :label="$t(item.title)"
                    @change="toggleInd(item.is_main, item.name, $event)"/>
        </div>
      </List>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import List from "~/components/kline/list.vue"
import Checkbox from "~/components/kline/checkbox.vue"
import {type PaneInds} from "~/composables/types";
import {computed, defineEmits, defineProps, reactive, watch} from "vue";
import kc, {Chart} from "klinecharts";
import {useKlineLocal} from "~/stores/klineLocal";
import {useNuxtApp} from "#app"
import Input from "~/components/kline/input.vue";
import {useI18n} from "vue-i18n";
const {t} = useI18n()
import {TakeawayBox, Cloudy} from "@element-plus/icons-vue";
import {useKlineStore} from "~/stores/kline";


const props = defineProps<{
  modelValue: boolean,
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

const {$emit} = useNuxtApp()
const store = useKlineLocal()
const main = useKlineStore()

const keyword = ref('')
const activeTab = ref('local')

const show_inds = computed(() => {
  if(keyword.value){
    const word = keyword.value.toUpperCase()
    return main.all_inds.filter(i => i.name.includes(word) || i.title.includes(word))
  }
  if(activeTab.value == 'local'){
    return main.all_inds.filter(i => !i.cloud)
  }
  return main.all_inds.filter(i => i.cloud)
})

const checked_inds = computed((): string[] => {
  return store.save_inds.map(d => d.name)
})

function toggleInd(is_main: boolean, name: string, val: any){
  $emit('set_ind', {is_main, ind_name: name, is_add: val as boolean})
}

</script>

<style lang="scss">
@import '~/assets/klinebase.scss';
.#{$prefix-cls}-symbol-search-modal-input{
  margin: 10px 0;
}
.#{$prefix-cls}-ind-box {
  flex-grow: 1;

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
    .#{$prefix-cls}-checkbox{
      flex-grow: 1;
    }
  }
  .row:hover {
    background: var(--klinecharts-pro-hover-background-color);
    .checkbox {
      fill: var(--klinecharts-pro-primary-color);
      color: var(--klinecharts-pro-primary-color);
    }
  }
}
.res-body{
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 500px;
}
.menu-box{
  width: 20%;
  border-right: 1px solid var(--klinecharts-pro-border-color);
  .item{
    padding: 10px;
    display: flex;
    align-items: center;
    cursor: pointer;
    border: 1px solid var(--klinecharts-pro-border-color);
    .el-icon{
      margin-right: 7px;
    }
    &.active{
      color: var(--klinecharts-pro-primary-color);
    }
    &:hover{
      background: var(--klinecharts-pro-hover-background-color);
    }
  }
}

</style>