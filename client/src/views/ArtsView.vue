<template>
  <GridTemplate :config="config" />
</template>

<script lang="ts">
import Vue from 'vue'
import GridTemplate from '@/templates/GridTemplate.vue'
import pages from '@/data/pages.json'

export default Vue.extend({
  components: { GridTemplate },
  data: () => ({ config: pages.arts }),
})
</script>
