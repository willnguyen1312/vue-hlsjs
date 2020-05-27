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
import { sleep } from "../utils";

@Component
export default class MediaProvider extends Vue {
  hls: Hls | null = null;
  mediaElement: HTMLVideoElement | null = null;
  isPlaying = false;

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

      newHls.attachMedia(this.getMediaElement());
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
    } else if (
      this.getMediaElement().canPlayType("application/vnd.apple.mpegurl")
    ) {
      // For native support like Apple's safari
      this.getMediaElement().src = this.mediaSource;
    }
  }

  getMediaElement() {
    if (!this.mediaElement) {
      throw new Error("Media element is not available");
    }
    return this.mediaElement;
  }

  checkMediaHasDataToPlay() {
    const currentTime = this.getMediaElement().currentTime;
    const timeRanges = Array.from(
      { length: this.getMediaElement().buffered.length },
      (_, index) => {
        return [
          this.getMediaElement().buffered.start(index),
          this.getMediaElement().buffered.end(index)
        ];
      }
    );

    return timeRanges.some(timeRange => {
      const [start, end] = timeRange;
      return currentTime >= start && currentTime <= end;
    });
  }

  @Provide() onSeeking() {
    this.currentTime = this.getMediaElement().currentTime;
    this.isLoading = this.checkMediaHasDataToPlay();
  }

  @Provide() async onLoadedMetadata() {
    while (this.getMediaElement().duration === Infinity) {
      // Edge cases: wait until duration is ready
      await sleep(100);
    }

    this.duration = this.getMediaElement().duration;
  }

  @Provide() onRateChange() {
    this.playbackRate = this.getMediaElement().playbackRate;
  }

  @Provide() onVolumeChange() {
    this.muted = this.getMediaElement().muted;
    this.volume = this.getMediaElement().volume;
  }

  @Provide() onPause() {
    this.paused = true;
    this.isPlaying = false;
  }

  @Provide() onPlay() {
    this.paused = false;
    this.ended = false;
    this.isPlaying = true;
  }

  @Provide() onCanPlay() {
    this.isLoading = false;
  }

  @Provide() onProgress() {
    this.isLoading = false;
    this.buffered = this.getMediaElement().buffered;
  }

  // The name is misleading as the event still get fired when data is available for playing
  @Provide() onWaiting() {
    this.isLoading = this.checkMediaHasDataToPlay();
  }

  @Provide() onTimeUpdate() {
    this.currentTime = this.getMediaElement().currentTime;
  }

  @Provide() onEnded() {
    this.ended = true;
  }

  @Provide() onPlaying() {
    this.isPlaying = true;
  }

  @Provide() setCurrentTime(currentTime: number) {
    this.getMediaElement().currentTime = currentTime;
  }

  @Provide() setLevel(level: number) {
    this.hls && (this.hls.currentLevel = level);
  }

  @Provide() setPlaybackRate(playbackRate: number) {
    this.getMediaElement().playbackRate = playbackRate;
  }

  @Provide() setVolume(volume: number) {
    this.getMediaElement().volume = volume;
  }

  @Provide() setMuted(muted: boolean) {
    this.getMediaElement().muted = muted;
  }

  @Provide() setPaused(paused: boolean) {
    this.paused = paused;
    const media = this.getMediaElement();
    if (paused && this.isPlaying) {
      media.pause();
    }

    if (!paused && !this.isPlaying) {
      media.play();
    }
  }

  @Provide() setCurrentBirateIndex(bitrateIndex: number) {
    this.autoBitrateEnabled = bitrateIndex === -1;
    this.currentBirateIndex = bitrateIndex;
    if (this.hls && this.hls.currentLevel !== bitrateIndex) {
      this.hls.currentLevel = bitrateIndex;
    }
  }
}
</script>
