import { defineNuxtPlugin } from '#app'
import mitt from 'mitt'
import {type AddDelInd} from "~/composables/types";

type AppEvents = {
  'set_ind': AddDelInd
}

export default defineNuxtPlugin(() => {
  const emitter = mitt<AppEvents>()
  return {
    provide: {
      on: emitter.on,
      emit: emitter.emit,
    }
  }
})