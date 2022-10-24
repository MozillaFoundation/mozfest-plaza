<template>
  <ScheduleView
    :schedule="filteredSchedule"
    :sessions="filteredSessions"
    :user-sessions="userSessions || []"
    :schedule-date="scheduleDate"
    :url-filters="urlFilters"
    @filter="onFilter"
    :filters-key="options.filtersKey"
    :config="options.scheduleConfig"
    :enabled-filters="options.enabledFilters"
    :is-during-conference="isDuringConference"
    :language-options="options.languages"
  >
    <slot name="title" slot="title" />
    <slot name="noResults" slot="noResults" />
    <slot name="infoText" slot="infoText" />
  </ScheduleView>
</template>

<script lang="ts">
import {
  FilteredScheduleOptions,
  filterScheduleFromSessions,
  getScheduleStartAndEnd,
  isInRange,
} from '@/lib/module'
import { ScheduleRecord, Session } from '@openlab/deconf-shared'
import {
  decodeUrlScheduleFilters,
  encodeScheduleFilters,
  ScheduleFilterRecord,
  ScheduleView,
} from '@openlab/deconf-ui-toolkit'
import Vue, { PropType } from 'vue'

interface Data {
  urlFilters: ScheduleFilterRecord | null
}

export default Vue.extend({
  components: { ScheduleView },
  props: {
    schedule: {
      type: Object as PropType<ScheduleRecord>,
      required: true,
    },
    userSessions: {
      type: Array as PropType<string[]>,
      required: false,
    },
    options: {
      type: Object as PropType<FilteredScheduleOptions>,
      required: true,
    },
  },
  data(): Data {
    return {
      urlFilters: decodeUrlScheduleFilters(this.$route.query),
    }
  },
  computed: {
    scheduleDate(): Date {
      return this.$dev.scheduleDate ?? this.$temporal.date
    },
    filteredSessions(): Session[] {
      return this.schedule.sessions.filter(
        (s) => s.slot && this.options.predicate(s)
      )
    },
    isDuringConference(): boolean {
      const range = getScheduleStartAndEnd(this.filteredSessions, this.schedule)
      if (!range) return false
      return isInRange(range, this.scheduleDate)
    },
    filteredSchedule(): ScheduleRecord {
      return filterScheduleFromSessions(this.schedule, this.filteredSessions)
    },
  },
  methods: {
    onFilter(filters: ScheduleFilterRecord) {
      this.$router.replace({
        query: encodeScheduleFilters(filters),
      })
    },
  },
})
</script>
