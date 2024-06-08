<template>
  <ContentLayout class="registerView">
    <ApiContent slug="register">
      <TitoWidget slot="tito" />
    </ApiContent>
  </ContentLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import { ApiContent } from '@openlab/deconf-ui-toolkit'
import { loadScript } from '@/lib/module'
import ContentLayout from '@/components/MozContentLayout.vue'
import TitoWidget from '@/components/TitoWidget.vue'

interface Data {
  scriptLoaded: boolean
}

export default Vue.extend({
  components: { ApiContent, ContentLayout, TitoWidget },
  data(): Data {
    return { scriptLoaded: false }
  },
  async mounted() {
    await loadScript('tito-widget', 'https://js.tito.io/v2')
    this.scriptLoaded = true
  },
})
</script>
