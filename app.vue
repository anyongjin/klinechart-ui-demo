<template>
  <Head>
    <Title>{{$t('appTitle')}}</Title>
  </Head>
  <NuxtLayout>
    <NuxtPage/>
  </NuxtLayout>
</template>

<script setup lang="ts">
import {useI18n} from "vue-i18n";
const {locale, t} = useI18n()

useSeoMeta({
  title: t('appTitle'),
  ogTitle: t('appTitle'),
  description: t('appDescription'),
  ogDescription: t('appDescription')
})
</script>

<style lang="scss">
@import "assets/site";
</style>
