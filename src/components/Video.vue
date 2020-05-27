<template>
  <div class="wrapper">
    <video controls class="video" :id="mediaId" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject } from "vue-property-decorator";

@Component
export default class MediaProvider extends Vue {
  @Inject() readonly mediaId!: string;
}
</script>

<style scoped>
.wrapper {
  display: flex;
  align-items: center;
  flex-direction: column;
}

.video {
  width: 810px;
  height: 450px;
}
</style>
