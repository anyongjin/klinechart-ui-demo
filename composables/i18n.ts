import {createI18n} from "vue-i18n";
import cn from "~/locales/cn.json";

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: 'cn',
  messages: {
    cn
  }
})

export default i18n
