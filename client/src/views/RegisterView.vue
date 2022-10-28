<template>
  <ContentLayout class="registerView">
    <ApiContent slug="register">
      <section v-if="scriptLoaded" slot="tito" class="titoWidget block">
        <tito-widget event="mozilla/mozilla-festival-2022"></tito-widget>
      </section>
    </ApiContent>
  </ContentLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import ContentLayout from '@/components/MozContentLayout.vue'
import { ApiContent } from '@openlab/deconf-ui-toolkit'
import { loadScript } from '@/lib/module'

interface Data {
  scriptLoaded: boolean
}

export default Vue.extend({
  components: { ApiContent, ContentLayout },
  data(): Data {
    return { scriptLoaded: false }
  },
  async mounted() {
    await loadScript('tito-widget', 'https://js.tito.io/v2')
    this.scriptLoaded = true
  },
})
</script>
