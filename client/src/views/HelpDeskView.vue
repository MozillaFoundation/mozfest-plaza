<template>
  <ContentLayout>
    <ApiContent slug="help">
      <iframe
        slot="feedback_form"
        class="airtable-embed airtable-dynamic-height"
        src="https://airtable.com/embed/shr8vppCwMf2JOYuU?backgroundColor=purple"
        frameborder="0"
        onmousewheel=""
        width="100%"
        height="736"
        style="background: transparent; border: 1px solid #ccc"
      ></iframe>
    </ApiContent>
  </ContentLayout>
</template>

<script lang="ts">
import Vue from 'vue'

import ContentLayout from '@/components/MozContentLayout.vue'
import { ApiContent } from '@openlab/deconf-ui-toolkit'
import { loadScript } from '@/lib/module'

export default Vue.extend({
  components: { ApiContent, ContentLayout },
  created() {
    loadScript(
      'tito-embed-v1',
      'https://static.airtable.com/js/embed/embed_snippet_v1.js'
    )
  },
})
</script>
