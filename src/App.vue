<template>
  <div id="app">
    <button
      @click="currentMediaSource = mediaSource.value"
      v-for="mediaSource in mediaSources"
      :key="mediaSource.id"
    >
      Source {{ mediaSource.id + 1 }}
    </button>

    <MediaProvider :mediaSource="currentMediaSource">
      <Video />
    </MediaProvider>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import MediaProvider from "./components/MediaProvider.vue";
import Video from "./components/Video.vue";

@Component({
  components: {
    MediaProvider,
    Video
  }
})
export default class App extends Vue {
  mediaSources = [
    {
      value: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
      id: 0
    },
    {
      value: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
      id: 1
    },
    {
      value:
        "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
      id: 2
    }
  ];

  currentMediaSource = this.mediaSources[0].value;
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
