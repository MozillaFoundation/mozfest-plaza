<template>
  <MozAppLayout>
    <MapTemplate :config="config" />
    <template #footer>
      <div></div>
    </template>
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import { getPageConfig, type MapOptions } from '@/lib/module.js'
import MapTemplate from '@/templates/MapTemplate.vue'
import MozPageFooter from '@/components/MozPageFooter.vue'

export default defineComponent({
  components: { MozAppLayout, MapTemplate, MozPageFooter },
  data: () => ({
    config: getPageConfig<MapOptions>('map'),
  }),
})
</script>
