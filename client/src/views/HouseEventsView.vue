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
      <p slot="title">{{ $t('mozfest.houseEvents.title') }}</p>
      <ApiContent slot="infoText" slug="moz-house-filters" />
      <p slot="noResults">{{ $t('mozfest.general.noResults') }}</p>
    </FilteredScheduleView>
    <InlineLoading v-else />
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
import {
  StorageKey,
  getLanguageOptions,
  mapApiState,
  trackIds,
} from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'

const trackAllowList = new Set([trackIds.mozHouse])

const options: FilteredScheduleOptions = {
  predicate: (s) => trackAllowList.has(s.track),
  filtersKey: StorageKey.HouseEventsFilters,
  enabledFilters: ['query', 'sessionType', 'language', 'theme'],
  scheduleConfig: {
    tileHeader: ['type'],
    tileAttributes: ['languages', 'themes'],
    tileActions: ['addToMySchedule', 'join'],
  },
  languages: getLanguageOptions(),
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { ApiContent, AppLayout, FilteredScheduleView, InlineLoading },
  data: (): Data => ({ options }),
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate() {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
  },
  mounted() {
    guardPage(this.schedule?.settings.house, this.user, this.$router)
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>
