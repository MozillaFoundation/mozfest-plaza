<template>
  <AppLayout>
    <FilteredScheduleView
      v-if="schedule"
      :schedule="schedule"
      :user-sessions="userSessions"
      :options="options"
      :schedule-date="scheduleDate"
      :route-query="$route.query"
      @filter="onFilter"
    >
      <span slot="title">{{ $t('deconf.schedule.title') }}</span>
      <ApiContent slot="infoText" slug="schedule-filters" />
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

const typeAllowList = new Set([
  'discussion',
  'workshop',
  'extended-workshop',
  'social-moments',
  'broadcast-talk',
  'community-plenary',
])

const options: FilteredScheduleOptions = {
  predicate: (s) => typeAllowList.has(s.type),
  filtersKey: StorageKey.ScheduleFilters,
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

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { AppLayout, FilteredScheduleView, ApiContent },
  data: (): Data => ({ options }),
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate() {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
  },
  mounted() {
    guardPage(this.schedule?.settings.schedule, this.user, this.$router)
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>
