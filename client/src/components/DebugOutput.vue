<template>
  <details v-if="$dev.isEnabled">
    <summary>Debug</summary>
    <pre>{{ value }}</pre>
  </details>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: ['value'],
})
</script>
