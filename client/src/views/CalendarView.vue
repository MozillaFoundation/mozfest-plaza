<template>
  <MozAppLayout>
    <ContentTemplate class="calendarView" :config="pages.calendar" />
  </MozAppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Routes } from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes } from '@/lib/constants'

import MozAppLayout from '@/components/MozAppLayout.vue'
import ContentTemplate from '@/templates/ContentTemplate.vue'
import { mapApiState, pages } from '@/lib/module.js'

export default defineComponent({
  components: { ContentTemplate, MozAppLayout },
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
