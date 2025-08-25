<template>
  <section v-if="scriptLoaded" class="titoWidget block">
    <tito-widget
      event="giantcookie-mozfest/mozilla-festival-2025"
      source="scheduleapp"
      :locale="$i18n.locale"
      v-pre
    ></tito-widget>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { loadScript } from '@/lib/module'

interface Data {
  scriptLoaded: boolean
}

export default defineComponent({
  data(): Data {
    return { scriptLoaded: false }
  },
  async mounted() {
    await loadScript('tito-widget', 'https://js.tito.io/v2')
    this.scriptLoaded = true
  },
})
</script>
