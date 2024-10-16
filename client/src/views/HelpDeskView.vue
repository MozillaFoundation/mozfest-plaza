<template>
  <MozAppLayout>
    <ContentTemplate :config="pages.helpDesk" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import MozAppLayout from '@/components/MozAppLayout.vue'
import ContentTemplate from '@/templates/ContentTemplate.vue'
import pages from '@/data/pages.json'

export default defineComponent({
  components: { ContentTemplate, MozAppLayout },
  data: () => ({ pages }),
})
</script>
