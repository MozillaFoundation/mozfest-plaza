<template>
  <VisitorsWidget v-if="config.kind == 'visitors'" :config="anyConfig" />
  <CustomWidget v-else-if="config.kind == 'custom'" :config="anyConfig" />
  <p v-else>unknown widget: {{ config }}</p>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import VisitorsWidget from './VisitorsWidget.vue'
import CustomWidget from './CustomWidget.vue'
import { type AtriumWidgetOptions } from '@/lib/module'

export default defineComponent({
  components: { VisitorsWidget, CustomWidget },
  props: {
    config: { type: Object as PropType<AtriumWidgetOptions>, required: true },
  },
  computed: {
    anyConfig() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return this.config as any
    },
  },
})
</script>
