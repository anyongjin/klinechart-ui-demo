import i18n from "~/composables/i18n";
import {defineNuxtPlugin} from "#app";

export default defineNuxtPlugin(({ vueApp }) => {
  vueApp.use(i18n)
})
