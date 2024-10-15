<template>
  <div class="anchorFmEmbed">
    <iframe
      :src="src"
      height="98px"
      width="400px"
      frameborder="0"
      scrolling="no"
    ></iframe>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    src: { type: String, required: true },
  },
})
</script>

<style lang="scss">
.anchorFmEmbed {
  height: 98px;
  max-width: 700px;

  background-color: $background;
  border-radius: $radius;
  overflow: hidden;

  position: relative;
}
.anchorFmEmbed > iframe {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}
</style>
