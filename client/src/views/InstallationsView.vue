<template>
  <MozAppLayout v-if="config">
    <CollageTemplate :config="config" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import CollageTemplate from '@/templates/CollageTemplate.vue'
import { getPageConfig, type CollageOptions } from '@/lib/module.js'

export default defineComponent({
  components: { CollageTemplate, MozAppLayout },
  data: () => ({
    config: getPageConfig<CollageOptions>('installations'),
  }),
})
</script>
