<template>
  <MozAppLayout v-if="config">
    <TimelineTemplate :config="config" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import TimelineTemplate from '@/templates/TimelineTemplate.vue'
import { getPageConfig, type TimelineOptions } from '@/lib/module.js'

export default defineComponent({
  components: { TimelineTemplate, MozAppLayout },
  data: () => ({
    config: getPageConfig<TimelineOptions>('schedule'),
  }),
})
</script>
