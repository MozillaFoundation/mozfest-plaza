<template>
  <iframe
    class="airtable-embed airtable-dynamic-height"
    src="https://airtable.com/embed/shrSoLQIyaX54VlAy?backgroundColor=teal"
    frameborder="0"
    onmousewheel=""
    width="100%"
    height="1770"
    style="background: transparent; border: 1px solid #ccc"
    loading="lazy"
  ></iframe>
</template>

<script lang="ts">
import { loadScript } from '@/lib/external-scripts'
import Vue from 'vue'

export default Vue.extend({
  props: {
    src: { type: String, required: true },
  },
  created() {
    loadScript(
      'tito-embed-v1',
      'https://static.airtable.com/js/embed/embed_snippet_v1.js'
    )
  },
})
</script>
