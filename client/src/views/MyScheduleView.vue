<template>
  <AppLayout>
    <FilteredScheduleView
      class="myScheduleView"
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
      :schedule-date="scheduleDate"
      :route-query="$route.query"
      @filter="onFilter"
    >
      <span slot="title">{{ $t('mozfest.mySchedule.title') }}</span>
      <ApiContent slot="infoText" slug="my-schedule" />
      <span slot="noResults">{{ $t('mozfest.general.noResults') }}</span>
    </FilteredScheduleView>
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  FilteredScheduleOptions,
  FilteredScheduleView,
  guardPage,
} from '@openlab/deconf-ui-toolkit'
import { StorageKey, getLanguageOptions, mapApiState } from '@/lib/module'

function makeOptions(userSessions: string[]): FilteredScheduleOptions {
  const set = new Set(userSessions)
  return {
    predicate: (s) => set.has(s.id),
    filtersKey: StorageKey.MyScheduleFilters,
    scheduleConfig: {
      tileHeader: ['type'],
      tileAttributes: ['languages', 'recorded', 'track', 'themes'],
      tileActions: ['addToMySchedule', 'join'],
    },
    enabledFilters: [
      'query',
      'sessionType',
      'track',
      'language',
      'date',
      'isRecorded',
      'theme',
    ],
    languages: getLanguageOptions(),
  }
}

// TODO: can this be migrated to TimelineTemplate ?
export default Vue.extend({
  components: { AppLayout, FilteredScheduleView, ApiContent },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate() {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
    options(): FilteredScheduleOptions {
      return makeOptions(this.userSessions ?? [])
    },
  },
  mounted() {
    guardPage(this.schedule?.settings.mySchedule, this.user, this.$router)
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>

<style>
.myScheduleView .scheduleView-viewControl {
  display: none;
}
</style>
