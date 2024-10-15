<template>
  <VisitorsWidget v-if="config.kind == 'visitors'" :config="config" />
  <CustomWidget v-else-if="config.kind == 'custom'" :config="config" />
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
})
</script>
