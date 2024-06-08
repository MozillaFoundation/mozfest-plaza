<template>
  <section v-if="scriptLoaded" slot="tito" class="titoWidget block">
    <tito-widget
      event="mozilla/mozfest-house-amsterdam-2024"
      :locale="$i18n.locale"
      v-pre
    ></tito-widget>
  </section>
</template>

<script lang="ts">
import Vue from 'vue'
import { loadScript } from '@/lib/module'

interface Data {
  scriptLoaded: boolean
}

export default Vue.extend({
  data(): Data {
    return { scriptLoaded: false }
  },
  async mounted() {
    await loadScript('tito-widget', 'https://js.tito.io/v2')
    this.scriptLoaded = true
  },
})
</script>
