<template>
  <AtriumTemplate :config="config" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AtriumTemplate from '@/templates/AtriumTemplate.vue'
import pages from '@/data/pages.json'

export default defineComponent({
  components: { AtriumTemplate },
  data: () => ({ config: pages.plaza }),
})
</script>
