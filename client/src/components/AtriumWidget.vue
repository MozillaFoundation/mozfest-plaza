<template>
  <VisitorsWidget v-if="config.kind == 'visitors'" :config="config" />
  <CustomWidget v-else-if="config.kind == 'custom'" :config="config" />
  <p v-else>unknown widget: {{ config.kind }}</p>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import VisitorsWidget from './VisitorsWidget.vue'
import CustomWidget from './CustomWidget.vue'
import { AtriumWidgetOptions } from '@/lib/module'

export default Vue.extend({
  components: { VisitorsWidget, CustomWidget },
  props: {
    config: { type: Object as PropType<AtriumWidgetOptions>, required: true },
  },
})
</script>
