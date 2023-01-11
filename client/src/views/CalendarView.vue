<template>
  <ContentLayout class="calendarView">
    <ApiContent slug="calendar">
      <section slot="calendar" class="calendarWidget block">
        <PrivateCalendarCreator api-module="api" />
      </section>
    </ApiContent>
  </ContentLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import ContentLayout from '@/components/MozContentLayout.vue'
import {
  ApiContent,
  mapApiState,
  PrivateCalendarCreator,
  Routes,
} from '@openlab/deconf-ui-toolkit'
import { ExtraRoutes } from '@/lib/constants'

export default Vue.extend({
  components: { ApiContent, ContentLayout, PrivateCalendarCreator },
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
.calendarView {
  .calendarWidget {
    border: 3px solid $border;
    border-radius: $radius;
    padding: 1rem;
  }
  .calendarWidget > * {
    margin-bottom: 0;
  }
  p:has(img) {
    text-align: center;
  }
}
</style>
