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
      class="appLayout-main"
    >
      <p slot="title">{{ $t('mozfest.houseEvents.title') }}</p>
      <p slot="infoText">{{ $t('mozfest.houseEvents.info') }}</p>
      <p slot="noResults">{{ $t('mozfest.houseEvents.noResults') }}</p>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.houseEvents.loading') }}
    </InlineLoading>
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
import { StorageKey, getLanguageOptions, mapApiState } from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'

const sessionTypeAllowList = new Set(['mozfest-house'])

const options: FilteredScheduleOptions = {
  predicate: (s) => sessionTypeAllowList.has(s.type),
  filtersKey: StorageKey.HouseEventsFilters,
  enabledFilters: ['query', 'track', 'language', 'theme'],
  scheduleConfig: {
    tileHeader: ['track'],
    tileAttributes: ['languages', 'themes'],
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
