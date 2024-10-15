<template>
  <ContentTemplate :config="pages.register" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import ContentTemplate from '@/templates/ContentTemplate.vue'
import pages from '@/data/pages.json'

export default defineComponent({
  components: { ContentTemplate },
  data: () => ({ pages }),
})
</script>
