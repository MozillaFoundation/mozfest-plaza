<template>
  <ColorWidget
    kind="secondary"
    :class="classes"
    :title="title"
    :subtitle="subtitle"
    :icon="['fas', 'users']"
  />
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import {
  ColorWidget,
  localiseFromObject,
  mapMetricsState,
} from '@openlab/deconf-ui-toolkit'
import type { VisitorsWidgetOptions } from '@/lib/module'

export default defineComponent({
  components: { ColorWidget },
  props: {
    config: { type: Object as PropType<VisitorsWidgetOptions>, required: true },
  },
  computed: {
    ...mapMetricsState('metrics', ['siteVisitors']),
    classes(): string {
      return `is-${this.config.id}`
    },
    title(): string {
      return this.siteVisitors?.toString() ?? '~'
    },
    subtitle(): string {
      return (
        localiseFromObject(this.$i18n.locale, this.config.options.subtitle) ??
        ''
      )
    },
  },
})
</script>
