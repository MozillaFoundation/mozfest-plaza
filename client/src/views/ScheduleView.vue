<template>
  <MozAppLayout>
    <TimelineTemplate :config="pages.schedule" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import TimelineTemplate from '@/templates/TimelineTemplate.vue'
import { pages } from '@/lib/module.js'

export default defineComponent({
  components: { TimelineTemplate, MozAppLayout },
  data: () => ({ pages }),
})
</script>
