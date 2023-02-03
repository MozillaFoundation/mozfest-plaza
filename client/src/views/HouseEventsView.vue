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
      <p slot="infoText">{{ $t('mozfest.houseEvents.info') }}</p>
      <p slot="noResults">{{ $t('mozfest.general.noResults') }}</p>
    </FilteredScheduleView>
    <InlineLoading v-else />
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import {
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

const trackAllowList = new Set(trackIds.mozone)

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
  components: { AppLayout, FilteredScheduleView, InlineLoading },
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
