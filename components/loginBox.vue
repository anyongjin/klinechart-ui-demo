<template>
  <Modal :title="$t(form_mode)" :width="500" v-model="showModal">
    <div class="login-box">
      <div class="logo-box">
        <img src="/logo_192.png" alt="logo"/>
      </div>
      <el-form v-if="form_mode == 'register'" ref="regFormRef" :model="regForm" :rules="regRules"
        class="form-area" status-icon>
        <el-form-item prop="username">
          <el-input v-model="regForm.username" :placeholder="$t('input_username')">
            <template #prepend>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="regForm.password" type="password" autocomplete="off" :show-password="showPwd"
                    :placeholder="$t('input_password')">
            <template #prepend>
              <el-icon><Key/></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password2">
          <el-input v-model="regForm.password2" type="password" autocomplete="off" :placeholder="$t('input_password2')">
            <template #prepend>
              <el-icon><Key/></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-text type="danger" v-if="err_msg">{{err_msg}}</el-text>
        <el-button size="large" type="primary" class="main" :loading="authDoing" @click="submitForm(regFormRef)">
          {{ $t('register') }}
        </el-button>
        <el-link @click="form_mode='login'">{{$t('register_to_login')}}</el-link>
      </el-form>
      <el-form v-else ref="loginFormRef" :model="loginForm" :rules="loginRules" class="form-area" status-icon>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :placeholder="$t('input_username')">
            <template #prepend>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" autocomplete="off" :show-password="showPwd"
                    :placeholder="$t('input_password')">
            <template #prepend>
              <el-icon><Key/></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-text type="danger" v-if="err_msg">{{err_msg}}</el-text>
        <el-button size="large" type="primary" class="main" :loading="authDoing" @click="submitForm(loginFormRef)">
          {{ $t('login') }}
        </el-button>
        <el-link @click="form_mode='register'">{{$t('login_to_register')}}</el-link>
      </el-form>
      <div class="login-btm">
        <span>{{$t('reg_log_accept')}} </span>
        <el-link target="_blank" :href="aggrement_url">{{$t('user_contract')}}</el-link>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from "~/components/kline/modal.vue"
import {Connection, User, Key, Promotion, Message, View, Hide} from "@element-plus/icons-vue";
import {useAuthState} from "~/composables/auth";
import {computed, reactive, ref, toRaw} from "vue";
import type {FormRules, FormInstance} from "element-plus";
import {useI18n} from "vue-i18n";
const {locale, t} = useI18n()

const {authData, authStatus, authToken, authDoing} = useAuthState()
interface RegRuleForm{
  binance_uid: number,
  username: string,
  password: string,
  password2: string
}
const regForm = reactive({
  binance_uid: '',
  username: '',
  password: '',
  password2: ''
})

const aggrement_url = computed(() => {
  return `/agreement.${locale.value}.html`
})

const validateBUid = (rule: any, value: any, callback: any) => {
  postApi('/user/check_exg_uid', {exchange: 'binance', uid: value.toString()}).then(rsp => {
    if(rsp.code == 200){
      callback()
    }
    else{
      callback(new Error(rsp.msg_code ? t(rsp.msg_code): (rsp.msg ?? 'Check Failed')))
    }
  })
}

const validatePass = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(t('this_is_required')))
  } else {
    if(!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d!@#$%^&*()]{10,}$/.test(value)){
      callback(new Error(t('pwd_format_error')))
    }
    else{
      callback()
    }
  }
}

const validatePass2 = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error(t('this_is_required')))
  } else if (value !== regForm.password) {
    callback(new Error(t('two_pwd_not_match')))
  } else {
    callback()
  }
}

const regRules = reactive<FormRules<RegRuleForm>>({
  binance_uid: [
    {required: true, message: t('this_is_required'), trigger: 'blur'},
    {type: 'number', message: t('this_is_number')},
    {validator: validateBUid, trigger: 'blur'}
  ],
  username: [{required: true, message: t('this_is_required'), trigger: 'blur'}],
  password: [{validator: validatePass, trigger: 'blur'}],
  password2: [{validator: validatePass2, trigger: 'blur'}],
})

const loginForm = reactive({
  username: '',
  password: ''
})
const loginRules = reactive<FormRules<RegRuleForm>>({
  username: [{required: true, message: t('this_is_required'), trigger: 'blur'}],
  password: [{validator: validatePass, trigger: 'blur'}],
})

const err_msg = ref('')
const form_mode = ref('register')
const showPwd = ref(false)
const regFormRef = ref<FormInstance>()
const loginFormRef = ref<FormInstance>()
if(process.client && localStorage.getItem('user_id')){
  form_mode.value = 'login'
}


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


const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (!valid)return
    authDoing.value = true
    let post_url = '/user/login_by_pwd'
    let post_data: any = toRaw(loginForm)
    if(form_mode.value === 'register'){
      post_url = '/user/reg_exg_uid'
      post_data = toRaw(regForm)
      post_data.exchange = 'binance'
      post_data.exg_uid = post_data.binance_uid.toString()
    }
    postApi(post_url, post_data).then(rsp => {
      authDoing.value = false
      if(rsp.code != 200 || !rsp.user){
        err_msg.value = rsp.msg_code ? t(rsp.msg_code): (rsp.msg ?? 'submit fail');
      }else{
        authData.value = rsp.user
        authToken.value = rsp.token
        showModal.value = false
        localStorage.setItem('user_id', rsp.user.id)
      }
    })
  })
}

</script>

<style scoped lang="scss">
@import "~/assets/klinebase.scss";
.login-box{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-box{
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 40px;
  img{
    width: 100px;
  }
}
.form-area{
  width: 70%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .el-form-item{
    width: 100%;
  }

  .el-button.main{
    width: 100%;
    margin: 20px auto;
  }
}
.login-btm{
  text-align: center;
  margin: 50px auto;
  color: #888;
  display: flex;
  align-items: center;
}
</style>