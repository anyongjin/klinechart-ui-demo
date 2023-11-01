import { computed } from 'vue'
import {useAppConfig} from '#app'
import {type AuthProvider, type SessionStatus, type UseAuthStateReturn} from './types'
import {useState, watch} from '#imports'
// @ts-ignore
import type { SessionData } from '#auth'
import {type DeepRequired} from "ts-essentials";
import defu from "defu"
import {useStorage} from "@vueuse/core";

const defaultsProvider: DeepRequired<AuthProvider> = {
  pages: {
    login: '/login'
  },
  token: {
    type: 'Bearer',
    headerName: 'Authorization',
    maxAgeInSeconds: 30 * 60
  },
  sessionDataType: { id: 'string | number' }
}


export const getAuthConfig = (): DeepRequired<AuthProvider> => {
  // @ts-ignore
  return defu(useAppConfig().auth, defaultsProvider) as DeepRequired<AuthProvider>
}


export const useAuthState = (): UseAuthStateReturn => {
  const authConfig = getAuthConfig()
  // Re-construct state from cookie, also setup a cross-component sync via a useState hack, see https://github.com/nuxt/nuxt/issues/13020#issuecomment-1397282717
  const _rawTokenCookie = useCookie<string | null>('authtoken', {
    default: () => null, maxAge: authConfig.token.maxAgeInSeconds, sameSite: 'lax' })

  const authToken = useState('auth:raw-token', () => _rawTokenCookie.value)
  watch(authToken, () => { _rawTokenCookie.value = authToken.value })

  const _rawAuthData = useStorage<SessionData | undefined | null>('auth:data', undefined)
  const authData = useState<SessionData | undefined | null>('auth:data', () => {
    try {
      return JSON.parse(_rawAuthData.value)
    }catch (e) {
      return undefined
    }
  })
  watch(authData, () => {_rawAuthData.value = JSON.stringify(authData.value)})

  // If session exists, initialize as not loading
  const authDoing = useState<boolean>('auth:loading', () => false)
  const authStatus = computed<SessionStatus>(() => {
    if (authDoing.value) {
      return 0
    }
    return authToken.value ? 1: -1
  })

  return {
    authData,
    authDoing,
    authStatus,
    authToken,
  }
}

export default useAuthState
