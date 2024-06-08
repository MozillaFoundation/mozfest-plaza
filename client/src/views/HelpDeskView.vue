<template>
  <ContentTemplate :config="pages.helpDesk" />
</template>

<script lang="ts">
import Vue from 'vue'

import ContentTemplate from '@/templates/ContentTemplate.vue'
import pages from '@/data/pages.json'

export default Vue.extend({
  components: { ContentTemplate },
  data: () => ({ pages }),
})
</script>
