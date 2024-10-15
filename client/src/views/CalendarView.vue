<template>
  <ContentTemplate class="calendarView" :config="pages.calendar" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { mapApiState, Routes } from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes } from '@/lib/constants'

import ContentTemplate from '@/templates/ContentTemplate.vue'
import pages from '@/data/pages.json'

export default defineComponent({
  components: { ContentTemplate },
  data: () => ({ pages }),
  computed: {
    ...mapApiState('api', ['user']),
  },
  mounted() {
    if (!this.user) {
      const redirect = this.$router.resolve({ name: ExtraRoutes.Calendar }).href
      this.$router.replace({
        name: Routes.Login,
        query: { redirect },
      })
    }
  },
})
</script>

<style lang="scss">
.calendarView p:has(img) {
  text-align: center;
}
</style>
