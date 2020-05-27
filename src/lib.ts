import MediaProvider from "./components/MediaProvider.vue";
import { VueConstructor } from "vue";

export default {
  install(Vue: VueConstructor) {
    Vue.component("MediaProvider", MediaProvider);
  }
};
