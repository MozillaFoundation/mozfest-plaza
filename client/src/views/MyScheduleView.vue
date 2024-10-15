<template>
  <AppLayout>
    <FilteredScheduleView
      class="myScheduleView"
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions ?? undefined"
      :options="options"
      :schedule-date="scheduleDate"
      :route-query="$route.query"
      @filter="onFilter"
    >
      <template v-slot:title>
        <span>{{ $t('mozfest.mySchedule.title') }}</span>
      </template>
      <template v-slot:infoText>
        <ApiContent slug="my-schedule" />
      </template>
      <template v-slot:noResults>
        <span>{{ $t('mozfest.general.noResults') }}</span>
      </template>
    </FilteredScheduleView>
  </AppLayout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import {
  ApiContent,
  type FilteredScheduleOptions,
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
export default defineComponent({
  components: { AppLayout, FilteredScheduleView, ApiContent },
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate(): Date {
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
