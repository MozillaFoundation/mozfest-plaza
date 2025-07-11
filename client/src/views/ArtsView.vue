<template>
  <MozAppLayout>
    <GridTemplate :config="config" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MozAppLayout from '@/components/MozAppLayout.vue'
import GridTemplate from '@/templates/GridTemplate.vue'
import { pages } from '@/lib/module.js'

export default defineComponent({
  components: { GridTemplate, MozAppLayout },
  data: () => ({ config: pages.arts }),
})
</script>
