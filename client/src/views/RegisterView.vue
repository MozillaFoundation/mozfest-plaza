<template>
  <MozAppLayout v-if="config">
    <ContentTemplate :config="config" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import ContentTemplate from '@/templates/ContentTemplate.vue'
import { getPageConfig, type ContentOptions } from '@/lib/module.js'

export default defineComponent({
  components: { ContentTemplate, MozAppLayout },
  data: () => ({
    config: getPageConfig<ContentOptions>('register'),
  }),
})
</script>
