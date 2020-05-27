<template>
  <div class="wrapper">
    <h1>Hello Video</h1>
    <video
      @loadedmetadata="onLoadedMetadata"
      @timeupdate="onTimeUpdate"
      controls
      class="video"
      :id="mediaId"
    />

    <p>PlaybackRate: {{ playbackRate }}</p>
    <p>Duration: {{ duration }}</p>
    <p>Volume: {{ volume }}</p>
    <p>Muted: {{ muted }}</p>
    <p>Curren time: {{ currentTime }}</p>
    <p>Resolution</p>

    <div class="resolution">
      <button @click="setLevel(-1)">Auto</button>
      <button
        @click="setLevel(index)"
        v-for="(bitrate, index) in bitrates"
        :key="bitrate.height"
      >
        {{ bitrate.height }}
      </button>
    </div>
    <p>Fps: {{ fps }}</p>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Inject, InjectReactive } from "vue-property-decorator";
import { BitrateInfo } from "../types";

@Component
export default class Video extends Vue {
  @Inject() readonly mediaId!: string;

  @InjectReactive() duration!: number;
  @InjectReactive() muted!: number;
  @InjectReactive() currentTime!: number;
  @InjectReactive() volume!: number;
  @InjectReactive() bitrates!: BitrateInfo[];
  @InjectReactive() playbackRate!: number;
  @InjectReactive() fps!: number;

  @Inject() readonly onLoadedMetadata!: () => void;
  @Inject() readonly onTimeUpdate!: () => void;
  @Inject() readonly setLevel!: () => void;
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

.resolution {
  display: flex;
}
</style>
