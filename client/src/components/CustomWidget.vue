<template>
  <ColorWidget
    kind="custom"
    :class="classes"
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :href="config.options.url"
  />
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { ColorWidget, localiseFromObject } from '@openlab/deconf-ui-toolkit'
import { CustomWidgetOptions } from '@/lib/module'

export default Vue.extend({
  components: { ColorWidget },
  props: {
    config: { type: Object as PropType<CustomWidgetOptions>, required: true },
  },
  computed: {
    classes(): string {
      return `is-${this.config.id}`
    },
    title(): string {
      return (
        localiseFromObject(this.$i18n.locale, this.config.options.title) ?? ''
      )
    },
    subtitle(): string {
      return (
        localiseFromObject(this.$i18n.locale, this.config.options.subtitle) ??
        ''
      )
    },
    icon(): string[] | null {
      for (const prefix of ['fas ', 'far ', 'fab ']) {
        if (this.config.options.icon.startsWith(prefix)) {
          return this.config.options.icon.split(/\s+/).slice(0, 2)
        }
      }
      return null
    },
  },
})
</script>
