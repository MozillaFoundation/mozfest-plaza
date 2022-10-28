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
      <span slot="title">{{ $t('mozfest.misinfoCon.title') }}</span>
      <ApiContent slot="infoText" slug="misinfo-con-filters" />
      <span slot="noResults">{{ $t('mozfest.misinfoCon.noResults') }}</span>
    </FilteredScheduleView>
    <InlineLoading v-else>
      {{ $t('mozfest.misinfoCon.loading') }}
    </InlineLoading>
  </AppLayout>
</template>

<script lang="ts">
import Vue from 'vue'
import AppLayout from '@/components/MozAppLayout.vue'
import InlineLoading from '@/components/InlineLoading.vue'
import {
  ApiContent,
  FilteredScheduleOptions,
  FilteredScheduleView,
  guardPage,
} from '@openlab/deconf-ui-toolkit'
import { StorageKey, getLanguageOptions, mapApiState } from '@/lib/module'

const typeAllowList = new Set(['misinfocon-discussion', 'misinfocon-workshop'])

const options: FilteredScheduleOptions = {
  predicate: (s) => typeAllowList.has(s.type),
  filtersKey: StorageKey.MisinfoConFilters,
  enabledFilters: ['query', 'sessionType', 'language', 'date', 'theme'],
  scheduleConfig: {
    tileHeader: ['type'],
    tileAttributes: ['languages', 'themes', 'recorded'],
    tileActions: ['addToMySchedule', 'join'],
  },
  languages: getLanguageOptions(),
}

interface Data {
  options: FilteredScheduleOptions
}

export default Vue.extend({
  components: { AppLayout, FilteredScheduleView, ApiContent, InlineLoading },
  data: (): Data => ({ options }),
  computed: {
    ...mapApiState('api', ['schedule', 'user', 'userSessions']),
    scheduleDate() {
      return this.$dev?.scheduleDate ?? this.$temporal.date
    },
  },
  created() {
    guardPage(this.schedule?.settings.misinfoCon, this.user, this.$router)
  },
  methods: {
    onFilter(query: Record<string, string>) {
      this.$router.replace({ query })
    },
  },
})
</script>
