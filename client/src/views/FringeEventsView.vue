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
      <span slot="title">{{ $t('mozfest.fringeEvents.title') }}</span>
      <ApiContent slot="infoText" slug="fringe-filters" />
      <span slot="noResults">{{ $t('mozfest.fringeEvents.noResults') }}</span>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.fringeEvents.loading') }}
    </InlineLoading>
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
import { getLanguageOptions, mapApiState, StorageKey } from '@/lib/module'
import InlineLoading from '@/components/InlineLoading.vue'

const typeAllowList = new Set(['fringe-events'])

const options: FilteredScheduleOptions = {
  predicate: (s) => typeAllowList.has(s.type),
  filtersKey: StorageKey.FringeEventsFilters,
  enabledFilters: ['query', 'track', 'language', 'date', 'theme'],
  scheduleConfig: {
    tileHeader: ['track'],
    tileAttributes: ['themes'],
  },
  languages: getLanguageOptions(),
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { AppLayout, FilteredScheduleView, InlineLoading, ApiContent },
  data: (): Data => ({ options }),
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate() {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
  },
  mounted() {
    guardPage(this.schedule?.settings.fringe, this.user, this.$router)
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>
