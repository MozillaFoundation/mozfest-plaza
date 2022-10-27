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
import { ApiContent, PrivateCalendarCreator } from '@openlab/deconf-ui-toolkit'

export default Vue.extend({
  components: { ApiContent, ContentLayout, PrivateCalendarCreator },
})
</script>

<style lang="scss">
.calendarView {
  .calendarWidget {
    border: 1px solid $border;
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
