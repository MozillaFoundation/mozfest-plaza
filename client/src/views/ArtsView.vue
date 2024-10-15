<template>
  <GridTemplate :config="config" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import GridTemplate from '@/templates/GridTemplate.vue'
import pages from '@/data/pages.json'

export default defineComponent({
  components: { GridTemplate },
  data: () => ({ config: pages.arts }),
})
</script>
