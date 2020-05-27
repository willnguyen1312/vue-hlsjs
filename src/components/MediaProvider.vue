<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Hls from "hls.js";
import {
  Prop,
  ProvideReactive,
  Provide,
  Vue,
  Component,
  Watch
} from "vue-property-decorator";
import { BitrateInfo } from "../types";

@Component
export default class MediaProvider extends Vue {
  hls: Hls = null;
  mediaElement: HTMLVideoElement = null;

  @Prop() readonly mediaSource!: string;
  @Provide() readonly mediaId: string = "vue-hls-media";

  @ProvideReactive() currentBirateIndex = -1;
  @ProvideReactive() bitrates: BitrateInfo[] = [];
  @ProvideReactive() autoBitrateEnabled = true;
  @ProvideReactive() fps = 0;

  @ProvideReactive() buffered: TimeRanges | null = null;
  @ProvideReactive() currentTime = 0;
  @ProvideReactive() duration = 0;
  @ProvideReactive() ended = false;
  @ProvideReactive() paused = true;
  @ProvideReactive() playbackRate = 1;
  @ProvideReactive() volume = 1;
  @ProvideReactive() muted = false;

  @ProvideReactive() isLoading = true;

  mounted() {
    this.mediaElement = document.getElementById(
      this.mediaId
    ) as HTMLVideoElement;
    this.initHlsResource();
  }

  @Watch("mediaSource")
  onChildChanged() {
    this.releaseHlsResource();
    this.initHlsResource();
  }

  releaseHlsResource() {
    if (this.hls) {
      this.hls.destroy();
    }
  }

  initHlsResource() {
    if (Hls.isSupported()) {
      const newHls = new Hls();
      this.hls = newHls;

      newHls.attachMedia(this.mediaElement);
      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(this.mediaSource);
      });

      newHls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        this.bitrates = ((data.levels as unknown) as Hls.Level[]).map(
          level => ({
            bitrate: level.bitrate,
            height: level.height,
            width: level.width
          })
        );
      });

      newHls.on(Hls.Events.FRAG_PARSING_DATA, (_, data) => {
        if (data.type === "video") {
          const fps = data.nb / (data.endPTS - data.startPTS);
          this.fps = Math.round(fps);
        }
      });

      newHls.on(Hls.Events.LEVEL_SWITCHED, (_, { level }) => {
        this.currentBirateIndex = level;
      });
    } else if (this.mediaElement.canPlayType("application/vnd.apple.mpegurl")) {
      // For native support like Apple's safari
      this.mediaElement.src = this.mediaSource;
    }
  }
}
</script>
