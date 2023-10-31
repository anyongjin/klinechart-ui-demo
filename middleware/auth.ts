// 此文件从nuxt-auth修改
import {navigateTo, defineNuxtRouteMiddleware} from '#app'
import {getAuthConfig, useAuthState} from "~/composables/auth/useAuthState"

type MiddlewareMeta = boolean | {
  unauthenticatedOnly: true,
  navigateAuthenticatedTo?: string,
}

declare module '#app/../pages/runtime/composables' {
  interface PageMeta {
    auth?: MiddlewareMeta
  }
}

export default defineNuxtRouteMiddleware((to) => {
  const metaAuth = to.meta.auth
  if (metaAuth === false) {
    return
  }

  const authConfig = getAuthConfig()
  const { authStatus } = useAuthState()
  const isGuestMode = typeof metaAuth === 'object' && metaAuth.unauthenticatedOnly
  // Guest mode happy path 1: Unauthenticated user is allowed to view page
  if (isGuestMode && authStatus.value < 0) {
    return
  }

  // Guest mode edge-case: Developer used guest-mode config style but set `unauthenticatedOnly` to `false`
  if (typeof metaAuth === 'object' && !metaAuth.unauthenticatedOnly) {
    return
  }

  if (authStatus.value > 0) {
    // Guest mode happy path 2: Authenticated user should be directed to another page
    if (isGuestMode) {
      return navigateTo(metaAuth.navigateAuthenticatedTo ?? '/')
    }
    return
  }

  const matchedRoute = to.matched.length > 0
  if (!matchedRoute) {
    // Hands control back to `vue-router`, which will direct to the `404` page
    return
  }

  return navigateTo(authConfig.pages.login)
})
