<template>
  <MozAppLayout v-if="config">
    <AtriumTemplate :config="config" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AtriumTemplate from '@/templates/AtriumTemplate.vue'
import MozAppLayout from '@/components/MozAppLayout.vue'
import { getPageConfig, type AtriumOptions } from '@/lib/module.js'

export default defineComponent({
  components: { AtriumTemplate, MozAppLayout },
  data: () => ({
    config: getPageConfig<AtriumOptions>('plaza'),
  }),
})
</script>
