<template>
  <div class="atriumVideo">
    <PrimaryEmbed
      v-if="isBefore"
      link="https://www.youtube.com/watch?v=scD8hwrY924"
    />

    <PrimaryEmbed
      v-if="isDuring"
      link="https://www.youtube.com/watch?v=t676EAhxB2g"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  isDuringConference,
  mapApiState,
  PrimaryEmbed,
} from '@openlab/deconf-ui-toolkit'

export default Vue.extend({
  components: { PrimaryEmbed },
  computed: {
    ...mapApiState('api', ['schedule']),
    scheduleDate(): Date {
      return this.$dev.scheduleDate ?? this.$temporal.date
    },
    isBefore(): boolean {
      if (!this.schedule) return false
      return (
        this.scheduleDate.getTime() < this.schedule.settings.startDate.getTime()
      )
    },
    isDuring(): boolean {
      return isDuringConference(
        this.scheduleDate,
        this.schedule?.settings ?? null
      )
    },
  },
})
</script>

<style lang="scss">
//
</style>
