<template>
  <MozAppLayout>
    <MapTemplate :config="config" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import { getPageConfig, type MapOptions } from '@/lib/module.js'
import MapTemplate from '@/templates/MapTemplate.vue'

export default defineComponent({
  components: { MozAppLayout, MapTemplate },
  data: () => ({
    config: getPageConfig<MapOptions>('map'),
  }),
})
</script>
