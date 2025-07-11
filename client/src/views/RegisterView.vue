<template>
  <MozAppLayout>
    <ContentTemplate :config="pages.register" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import ContentTemplate from '@/templates/ContentTemplate.vue'
import { pages } from '@/lib/module.js'

export default defineComponent({
  components: { ContentTemplate, MozAppLayout },
  data: () => ({ pages }),
})
</script>
