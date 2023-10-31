import { type CookieRef } from '#app'
// @ts-ignore
import type { SessionData } from '#auth'

type DataObjectPrimitives = 'string' | 'number' | 'boolean' | 'any' | 'undefined' | 'function' | 'null'

type DataObjectArray = `${string}[]`


export type AuthProvider = {
  pages?: {
    /**
     * 当访问需要登录的页面且未登录时，跳转到登录页面
     * @default '/login'
     */
    login?: string
  },
  token?: {
    /**
     * 请求头中携带的token类型。
     * @default Bearer
     * @exmaple Beer
     */
    type?: string,
    /**
     * 携带认证信息的请求头键
     * @default Authorization
     * @exmaple Auth
     */
    headerName?: string,
    /**
     * 保存token的最长时间，超过此时间在客户端自动删除。
     */
    maxAgeInSeconds?: number,
  }
  /**
   * 定义登录成功后返回的用户信息各个字段类型
   * @default { id: 'string | number' }
   * @example { id: 'string', name: 'string', email: 'string' }
   * @advanced_array_example { id: 'string', email: 'string', name: 'string', role: 'admin | guest | account', subscriptions: "{ id: number, status: 'ACTIVE' | 'INACTIVE' }[]" }
   */
  sessionDataType?: SessionDataObject,
}


export type SessionDataObject = {
  [key: string]: Omit<string, DataObjectPrimitives | DataObjectArray> | SessionDataObject
};

export type SessionStatus = -1 | 0 | 1  // 未登录 | 登录中 | 已登录
type WrappedSessionData = Ref<SessionData | null | undefined>

export interface UseAuthStateReturn {
  authData: WrappedSessionData
  authDoing: Ref<boolean>
  authStatus: ComputedRef<SessionStatus>,
  authToken: CookieRef<string | null>
}